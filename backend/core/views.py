import hashlib
import secrets
from datetime import timedelta

from django.conf import settings
from django.contrib.auth import authenticate, get_user_model
from django.core.mail import send_mail
from django.db.models import Q
from django.utils import timezone
from rest_framework import generics, status, viewsets
from rest_framework import serializers as drf_serializers
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from core.models.notification import Notification
from core.services.microsoft_oauth import exchange_code, get_authorization_url
from core.throttles import AuthRateThrottle, EmailVerificationRateThrottle
from marketplace.models import Products
from marketplace.serializers.product import ProductListSerializer
from marketplace.services.s3_service import upload_profile_picture
from social.models import UserConnection

from .models.email_verification import EmailVerificationToken
from .serializers import (
    NotificationSerializer,
    SignInSerializer,
    SignUpSerializer,
    UserProfileSerializer,
)

User = get_user_model()


def _hash_token(raw: str) -> str:
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def create_email_verification_token(user, minutes: int | None = None) -> str:
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
    throttle_classes = [AuthRateThrottle]

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

        # Genera token y manda correo — atómico para evitar token huérfano si falla el envío
        from django.db import transaction as db_transaction

        frontend_base = getattr(settings, "FRONTEND_BASE_URL", "http://localhost:3001")
        with db_transaction.atomic():
            raw_token = create_email_verification_token(user)
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
    throttle_classes = [AuthRateThrottle]

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

        # HU-CORE-17: bloquear login si la cuenta fue desactivada lógicamente
        if getattr(user, "is_deactivated", False):
            return Response(
                {
                    "error": {
                        "code": "ACCOUNT_DEACTIVATED",
                        "message": (
                            "Tu cuenta está desactivada. "
                            "Revisa tu correo o solicita un enlace de reactivación en /api/auth/account/reactivate/send/"
                        ),
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
    throttle_classes = [EmailVerificationRateThrottle]

    def post(self, request):
        email = (request.data.get("email") or "").strip().lower()

        generic_msg = {
            "message": "Si el correo existe, se enviará un email de verificación."
        }

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


# ── User Search ──────────────────────────────────────────


class UserSearchView(generics.ListAPIView):
    """GET /api/auth/users/search/?q=query — search users by name or email."""

    permission_classes = [IsAuthenticated]

    class UserSearchSerializer(drf_serializers.ModelSerializer):
        full_name = drf_serializers.SerializerMethodField()

        class Meta:
            model = User
            fields = [
                "id",
                "email",
                "first_name",
                "last_name",
                "full_name",
                "profile_picture",
            ]
            read_only_fields = fields

        def get_full_name(self, obj):
            return obj.get_full_name()

    serializer_class = UserSearchSerializer

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
                is_deactivated=False,
            )
            .exclude(id=self.request.user.id)
            .order_by("first_name")[:20]
        )


# ── Dashboard (HU-CORE-04) ───────────────────────────────


class DashboardView(APIView):
    """GET /api/auth/dashboard/ — aggregated home dashboard data."""

    permission_classes = [AllowAny]

    def get(self, request):
        recent_products = (
            Products.objects.select_related("category", "seller")
            .filter(status="disponible")
            .order_by("-created_at")[:6]
        )

        user_products = []
        user_products_count = 0
        user_points = 0

        if request.user and request.user.is_authenticated:
            user_qs = (
                Products.objects.select_related("category", "seller")
                .filter(seller=request.user)
                .order_by("-created_at")
            )
            user_products_count = user_qs.count()
            user_products = user_qs[:3]
            user_points = getattr(request.user, "points", 0)

        serializer_context = {"request": request}

        data = {
            "recent_products": ProductListSerializer(
                recent_products,
                many=True,
                context=serializer_context,
            ).data,
            "user_products": ProductListSerializer(
                user_products,
                many=True,
                context=serializer_context,
            ).data,
            "user_products_count": user_products_count,
            "active_transactions_count": 0,
            "gamification": {
                "points": user_points,
                "badges_count": 0,
            },
        }

        return Response(data, status=status.HTTP_200_OK)


# ── Profile Picture Upload (HU-CORE-10) ─────────────────


class MicrosoftAuthURLView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        if not getattr(settings, "MICROSOFT_CLIENT_ID", ""):
            return Response(
                {
                    "error": {
                        "code": "OAUTH_NOT_CONFIGURED",
                        "message": "Microsoft OAuth no está configurado.",
                    }
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        state = secrets.token_urlsafe(16)
        auth_url = get_authorization_url(state)
        return Response({"auth_url": auth_url, "state": state})


class MicrosoftCallbackView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        code = (request.data.get("code") or "").strip()
        if not code:
            return Response(
                {
                    "error": {
                        "code": "MISSING_CODE",
                        "message": "Se requiere el código de autorización.",
                    }
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            user_info = exchange_code(code)
        except ValueError as exc:
            return Response(
                {"error": {"code": "MICROSOFT_AUTH_FAILED", "message": str(exc)}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        email = user_info["email"]
        if not email.endswith("@iteso.mx"):
            return Response(
                {
                    "error": {
                        "code": "INVALID_EMAIL_DOMAIN",
                        "message": "Se requiere una cuenta @iteso.mx.",
                    }
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                "first_name": user_info["first_name"],
                "last_name": user_info["last_name"],
                "is_email_verified": True,
                "is_active": True,
            },
        )

        if created:
            user.set_unusable_password()
            user.save(update_fields=["password"])
        elif not user.is_active:
            return Response(
                {
                    "error": {
                        "code": "ACCOUNT_DISABLED",
                        "message": "Esta cuenta ha sido desactivada.",
                    }
                },
                status=status.HTTP_403_FORBIDDEN,
            )
        elif getattr(user, "is_deactivated", False):
            return Response(
                {
                    "error": {
                        "code": "ACCOUNT_DEACTIVATED",
                        "email": email,
                        "message": "Tu cuenta está desactivada.",
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


class ProfilePictureUploadView(APIView):
    """POST /api/auth/profile/upload-picture/ — upload profile image."""

    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser]

    ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
    MAX_SIZE = 5 * 1024 * 1024

    def post(self, request):
        file = request.FILES.get("file")
        if not file:
            return Response(
                {
                    "error": {
                        "code": "NO_FILE",
                        "message": "No se envio ningun archivo.",
                    }
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        if file.content_type not in self.ALLOWED_TYPES:
            return Response(
                {
                    "error": {
                        "code": "INVALID_TYPE",
                        "message": "Solo imagenes (JPEG, PNG, WebP, GIF).",
                    }
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        if file.size > self.MAX_SIZE:
            return Response(
                {"error": {"code": "FILE_TOO_LARGE", "message": "Max 5 MB."}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = request.user
        file_url = upload_profile_picture(user.id, file)
        user.profile_picture = file_url
        user.save(update_fields=["profile_picture"])

        return Response({"profile_picture": file_url}, status=status.HTTP_200_OK)


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by(
            "-created_at"
        )

    @action(detail=True, methods=["patch"])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.read_at = timezone.now()
        notification.save(update_fields=["is_read", "read_at"])
        return Response({"status": "notification marked as read"})


# ── Share Item with Friends (HU-CORE-12) ─────────────────


class ShareItemView(APIView):
    """POST /api/auth/shares/ — share a product with friends via notifications."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        product_id = request.data.get("product_id")
        friend_ids = request.data.get("friend_ids", [])

        if not product_id:
            return Response(
                {
                    "error": {
                        "code": "MISSING_FIELD",
                        "message": "product_id es requerido.",
                    }
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not friend_ids or not isinstance(friend_ids, list):
            return Response(
                {
                    "error": {
                        "code": "MISSING_FIELD",
                        "message": "friend_ids es requerido (lista de IDs).",
                    }
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            product = Products.objects.get(pk=product_id, status="disponible")
        except Products.DoesNotExist:
            return Response(
                {
                    "error": {
                        "code": "NOT_FOUND",
                        "message": "Producto no encontrado o no disponible.",
                    }
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        user = request.user
        accepted_connections = UserConnection.objects.filter(
            Q(requester=user, status="accepted") | Q(addressee=user, status="accepted")
        )
        connected_ids = set()
        for conn in accepted_connections:
            connected_ids.add(
                conn.requester_id if conn.addressee_id == user.id else conn.addressee_id
            )

        invalid_ids = [fid for fid in friend_ids if fid not in connected_ids]
        if invalid_ids:
            return Response(
                {
                    "error": {
                        "code": "NOT_FRIENDS",
                        "message": f"No eres amigo de los usuarios: {invalid_ids}",
                    }
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        notifications = []
        for fid in friend_ids:
            notifications.append(
                Notification(
                    user_id=fid,
                    type="shared_item",
                    title=f"{user.get_full_name()} te compartio un producto",
                    body=product.title,
                    reference_id=product.id,
                )
            )
        Notification.objects.bulk_create(notifications)

        return Response(
            {"message": f"Producto compartido con {len(friend_ids)} amigo(s)."},
            status=status.HTTP_201_CREATED,
        )

