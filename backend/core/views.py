import hashlib
import secrets
from datetime import timedelta

from django.conf import settings
from django.contrib.auth import authenticate, get_user_model
from django.core.mail import send_mail
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from .models.email_verification import EmailVerificationToken
from .serializers import SignInSerializer, SignUpSerializer, UserProfileSerializer

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
