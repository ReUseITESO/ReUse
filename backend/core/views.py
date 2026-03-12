from datetime import timedelta
import hashlib
import secrets

from django.conf import settings
from django.contrib.auth import authenticate, get_user_model
from django.utils import timezone

from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from .models.email_verification import EmailVerificationToken
from .serializers import SignUpSerializer, SignInSerializer, UserProfileSerializer
from django.core.mail import send_mail

User = get_user_model()

def _hash_token(raw: str) -> str:
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def create_email_verification_token(user, minutes: int = None) -> str:
    """
    Crea token de verificación (one-time) y guarda el hash en DB.
    Devuelve el token plano para mandarlo por email.
    """
    if minutes is None:
        minutes = int(getattr(settings, "EMAIL_VERIFICATION_EXPIRES_MINUTES", 30))

    raw_token = secrets.token_urlsafe(32)
    token_hash = _hash_token(raw_token)

    expires_at = timezone.now() + timedelta(minutes=minutes)

    EmailVerificationToken.objects.create(
        user=user,
        token_hash=token_hash,
        expires_at=expires_at,
    )

    return raw_token


def verify_email_token(raw_token: str):
    """
    Returns: (user, error_code)
    error_code: None | INVALID | USED | EXPIRED
    """
    token_hash = _hash_token(raw_token)

    token_obj = (
        EmailVerificationToken.objects.select_related("user")
        .filter(token_hash=token_hash)
        .first()
    )
    if not token_obj:
        return None, "INVALID"

    if token_obj.used_at is not None:
        return None, "USED"

    if timezone.now() >= token_obj.expires_at:
        return None, "EXPIRED"

    user = token_obj.user

    # one-time: marca usado
    token_obj.used_at = timezone.now()
    token_obj.save(update_fields=["used_at"])

    # verifica usuario
    user.is_email_verified = True
    user.email_verified_at = timezone.now()
    user.is_active = True
    user.save(update_fields=["is_email_verified", "email_verified_at", "is_active"])

    return user, None



def send_verification_email(to_email: str, verify_url: str):
    subject = "Verifica tu correo - ReUseITESO"
    message = (
        "Gracias por registrarte.\n\n"
        "Para activar tu cuenta, verifica tu correo en este enlace:\n"
        f"{verify_url}\n\n"
        "Si tú no creaste esta cuenta, ignora este mensaje."
    )

    send_mail(
        subject=subject,
        message=message,
        from_email=getattr(settings, "DEFAULT_FROM_EMAIL", "no-reply@reuse.com"),
        recipient_list=[to_email],
        fail_silently=False,
    )




class SignUpView(generics.CreateAPIView):
    """
    POST /api/auth/signup/
    Registra un nuevo usuario ITESO. Requiere verificación de correo para activar la cuenta.
    """

    serializer_class = SignUpSerializer
    permission_classes = [AllowAny]

    # Cambios realizados para mandar el tocken con verificacion al correo
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save()

        # inactivo hasta verificar
        user.is_active = False
        user.is_email_verified = False
        user.email_verified_at = None
        user.save(update_fields=["is_active", "is_email_verified", "email_verified_at"])

        # Genera token y manda correo
        raw_token = create_email_verification_token(user)
        frontend_base = getattr(settings, "FRONTEND_BASE_URL", "http://localhost:3001")
        verify_url = f"{frontend_base}/auth/verify?token={raw_token}"
        send_verification_email(user.email, verify_url)

        return Response(
            {
                "message": "Cuenta creada. Revisa tu correo para verificar tu cuenta.",
                "user": UserProfileSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )

class SignInView(APIView):
    """
    POST /api/auth/signin/
    Autentica al usuario con email y contraseña, devuelve tokens JWT.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = SignInSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"].lower().strip()
        password = serializer.validated_data["password"]

        user = authenticate(request, email=email, password=password)

        if user is None:
            return Response(
                {
                    "error": {
                        "code": "INVALID_CREDENTIALS",
                        "message": "Correo o contraseña incorrectos.",
                    }
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )
        if not user.is_email_verified:
            return Response(
                {
                    "error": {
                        "code": "EMAIL_NOT_VERIFIED",
                        "message": "Debes verificar tu correo antes de iniciar sesión.",
                    }
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        if not user.is_active:
            return Response(
                {
                    "error": {
                        "code": "ACCOUNT_DISABLED",
                        "message": "Esta cuenta ha sido desactivada.",
                    }
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "message": "Sesión iniciada correctamente.",
                "user": UserProfileSerializer(user).data,
                "tokens": {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                },
            },
            status=status.HTTP_200_OK,
        )


class SignOutView(APIView):
    """
    POST /api/auth/signout/
    Invalida el refresh token (blacklist) para cerrar sesión.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")

        if not refresh_token:
            return Response(
                {
                    "error": {
                        "code": "MISSING_TOKEN",
                        "message": "Se requiere el refresh token.",
                    }
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except TokenError:
            return Response(
                {
                    "error": {
                        "code": "INVALID_TOKEN",
                        "message": "Token inválido o ya expirado.",
                    }
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {"message": "Sesión cerrada correctamente."},
            status=status.HTTP_200_OK,
        )


class ProfileView(generics.RetrieveUpdateAPIView):
    """
    GET  /api/auth/profile/  – Obtener perfil del usuario autenticado.
    PATCH /api/auth/profile/ – Actualizar perfil del usuario autenticado.
    """

    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user

class EmailVerificationSendView(APIView):
    """
    POST /api/auth/email-verification/send/
    Dispara (re)envío de correo de verificación.
    Respuesta genérica para no filtrar si el email existe.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        email = (request.data.get("email") or "").strip().lower()

        generic_msg = {"message": "Si el correo existe, se enviará un email de verificación."}

        if not email:
            return Response(generic_msg, status=status.HTTP_200_OK)

        user = User.objects.filter(email=email).first()
        if not user:
            return Response(generic_msg, status=status.HTTP_200_OK)

        if getattr(user, "is_email_verified", False):
            return Response(generic_msg, status=status.HTTP_200_OK)

        raw_token = create_email_verification_token(user)

        frontend_base = getattr(settings, "FRONTEND_BASE_URL", "http://localhost:3001")
        verify_url = f"{frontend_base}/auth/verify?token={raw_token}"

        send_verification_email(user.email, verify_url)

        return Response(generic_msg, status=status.HTTP_200_OK)


class EmailVerificationConfirmView(APIView):
    """
    GET /api/auth/email-verification/confirm/?token=...
    Verifica token one-time. Si es válido:
    - marca usuario verificado y activo
    - devuelve JWT tokens (login automático)
    """
    permission_classes = [AllowAny]

    def get(self, request):
        token = (request.query_params.get("token") or "").strip()

        if not token:
            return Response(
                {"error": {"code": "TOKEN_MISSING", "message": "Token faltante."}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user, err = verify_email_token(token)

        if err == "INVALID":
            return Response(
                {"error": {"code": "TOKEN_INVALID", "message": "Token inválido."}},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if err == "USED":
            return Response(
                {"error": {"code": "TOKEN_USED", "message": "Token ya fue usado."}},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if err == "EXPIRED":
            return Response(
                {"error": {"code": "TOKEN_EXPIRED", "message": "Token expirado."}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "message": "Correo verificado. Sesión iniciada correctamente.",
                "user": UserProfileSerializer(user).data,
                "tokens": {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                },
            },
            status=status.HTTP_200_OK,
        )


# ── Friend System ────────────────────────────────────────

from django.db.models import Q
from core.models.friendship import FriendRequest, Friendship
from core.serializers import (
    UserSearchSerializer,
    FriendRequestSerializer,
    FriendRequestCreateSerializer,
)


class UserSearchView(generics.ListAPIView):
    """GET /api/auth/users/search/?q=query — search users by name or email."""

    serializer_class = UserSearchSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        query = self.request.query_params.get("q", "").strip()
        if len(query) < 2:
            return User.objects.none()

        return (
            User.objects.filter(
                Q(first_name__icontains=query)
                | Q(last_name__icontains=query)
                | Q(email__icontains=query),
                is_active=True,
            )
            .exclude(id=self.request.user.id)
            .order_by("first_name")[:20]
        )


class SendFriendRequestView(APIView):
    """POST /api/auth/friends/request/ — send a friend request."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = FriendRequestCreateSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)

        friend_request = FriendRequest.objects.create(
            from_user=request.user,
            to_user_id=serializer.validated_data["to_user_id"],
        )

        return Response(
            FriendRequestSerializer(friend_request).data,
            status=status.HTTP_201_CREATED,
        )


class PendingFriendRequestsView(generics.ListAPIView):
    """GET /api/auth/friends/requests/ — list pending incoming requests."""

    serializer_class = FriendRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return FriendRequest.objects.filter(
            to_user=self.request.user, status="pending"
        ).select_related("from_user", "to_user")


class AcceptFriendRequestView(APIView):
    """POST /api/auth/friends/requests/<id>/accept/ — accept a request."""

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            friend_request = FriendRequest.objects.get(
                pk=pk, to_user=request.user, status="pending"
            )
        except FriendRequest.DoesNotExist:
            return Response(
                {"error": {"code": "NOT_FOUND", "message": "Solicitud no encontrada."}},
                status=status.HTTP_404_NOT_FOUND,
            )

        friend_request.status = "accepted"
        friend_request.save(update_fields=["status", "updated_at"])

        user_ids = sorted([friend_request.from_user_id, friend_request.to_user_id])
        Friendship.objects.get_or_create(
            user1_id=user_ids[0], user2_id=user_ids[1]
        )

        return Response(
            {"message": "Solicitud aceptada."},
            status=status.HTTP_200_OK,
        )


class RejectFriendRequestView(APIView):
    """POST /api/auth/friends/requests/<id>/reject/ — reject a request."""

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            friend_request = FriendRequest.objects.get(
                pk=pk, to_user=request.user, status="pending"
            )
        except FriendRequest.DoesNotExist:
            return Response(
                {"error": {"code": "NOT_FOUND", "message": "Solicitud no encontrada."}},
                status=status.HTTP_404_NOT_FOUND,
            )

        friend_request.status = "rejected"
        friend_request.save(update_fields=["status", "updated_at"])

        return Response(
            {"message": "Solicitud rechazada."},
            status=status.HTTP_200_OK,
        )


class FriendsListView(APIView):
    """GET /api/auth/friends/ — list current friends."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        friendships = Friendship.objects.filter(
            Q(user1=user) | Q(user2=user)
        ).select_related("user1", "user2")

        friends = []
        for f in friendships:
            friend = f.user2 if f.user1_id == user.id else f.user1
            friends.append(friend)

        serializer = UserSearchSerializer(friends, many=True)
        return Response(
            {"count": len(friends), "results": serializer.data},
            status=status.HTTP_200_OK,
        )


class RemoveFriendView(APIView):
    """DELETE /api/auth/friends/<user_id>/ — remove a friend."""

    permission_classes = [IsAuthenticated]

    def delete(self, request, user_id):
        user = request.user
        deleted_count, _ = Friendship.objects.filter(
            Q(user1=user, user2_id=user_id) | Q(user1_id=user_id, user2=user)
        ).delete()

        if deleted_count == 0:
            return Response(
                {"error": {"code": "NOT_FOUND", "message": "Amistad no encontrada."}},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(
            {"message": "Amigo eliminado."},
            status=status.HTTP_200_OK,
        )
