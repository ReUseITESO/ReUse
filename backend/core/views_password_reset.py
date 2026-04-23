"""
HU-CORE-19: Password reset views.
Kept separate from views.py to avoid merge conflicts with other teams.
"""

import hashlib
import secrets
from datetime import timedelta

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.db import transaction
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models.password_reset_token import PasswordResetToken
from .throttles import PasswordResetRateThrottle

User = get_user_model()

PASSWORD_RESET_EXPIRES_MINUTES = 60
GENERIC_RESPONSE = {
    "message": "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña."
}


def _hash_token(raw: str) -> str:
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


class PasswordResetSendView(APIView):
    """
    POST /api/auth/password-reset/send/
    Envía email con enlace de restablecimiento. Respuesta genérica para no filtrar existencia.
    """

    permission_classes = [AllowAny]
    throttle_classes = [PasswordResetRateThrottle]

    def post(self, request):
        email = (request.data.get("email") or "").strip().lower()

        if not email:
            return Response(GENERIC_RESPONSE, status=status.HTTP_200_OK)

        user = User.objects.filter(email=email).first()
        if not user:
            return Response(GENERIC_RESPONSE, status=status.HTTP_200_OK)

        raw_token = secrets.token_urlsafe(32)
        token_hash = _hash_token(raw_token)
        expires_at = timezone.now() + timedelta(minutes=PASSWORD_RESET_EXPIRES_MINUTES)

        frontend_base = getattr(settings, "FRONTEND_BASE_URL", "http://localhost:3000")
        reset_url = f"{frontend_base}/auth/reset-password?token={raw_token}"

        # HU-CORE-19: atómico — si send_mail falla, el token no queda huérfano en BD
        with transaction.atomic():
            PasswordResetToken.objects.create(
                user=user,
                token_hash=token_hash,
                expires_at=expires_at,
            )
            send_mail(
                subject="Restablece tu contraseña - ReUseITESO",
                message=(
                    "Recibimos una solicitud para restablecer la contraseña de tu cuenta.\n\n"
                    f"Haz clic en el siguiente enlace para crear una nueva contraseña:\n{reset_url}\n\n"
                    f"Este enlace expira en {PASSWORD_RESET_EXPIRES_MINUTES} minutos.\n\n"
                    "Si no solicitaste esto, ignora este mensaje."
                ),
                from_email=getattr(
                    settings, "DEFAULT_FROM_EMAIL", "no-reply@reuse.com"
                ),
                recipient_list=[user.email],
                fail_silently=False,
            )

        return Response(GENERIC_RESPONSE, status=status.HTTP_200_OK)


class PasswordResetConfirmView(APIView):
    """
    POST /api/auth/password-reset/confirm/
    Valida el token y actualiza la contraseña.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        raw_token = (request.data.get("token") or "").strip()
        new_password = request.data.get("new_password") or ""
        confirm_password = request.data.get("confirm_password") or ""

        if not raw_token:
            return Response(
                {"error": {"code": "TOKEN_MISSING", "message": "Token faltante."}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not new_password:
            return Response(
                {
                    "error": {
                        "code": "PASSWORD_MISSING",
                        "message": "La nueva contraseña es requerida.",
                    }
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if new_password != confirm_password:
            return Response(
                {
                    "error": {
                        "code": "PASSWORD_MISMATCH",
                        "message": "Las contraseñas no coinciden.",
                    }
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        token_hash = _hash_token(raw_token)
        token_obj = (
            PasswordResetToken.objects.select_related("user")
            .filter(token_hash=token_hash)
            .first()
        )

        if not token_obj:
            return Response(
                {"error": {"code": "TOKEN_INVALID", "message": "Token inválido."}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if token_obj.used_at is not None:
            return Response(
                {"error": {"code": "TOKEN_USED", "message": "Este enlace ya fue usado."}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if timezone.now() >= token_obj.expires_at:
            return Response(
                {
                    "error": {
                        "code": "TOKEN_EXPIRED",
                        "message": "El enlace ha expirado. Solicita uno nuevo.",
                    }
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = token_obj.user

        try:
            validate_password(new_password, user=user)
        except ValidationError as exc:
            return Response(
                {
                    "error": {
                        "code": "PASSWORD_INVALID",
                        "message": " ".join(exc.messages),
                    }
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # HU-CORE-19: atómico — si falla el save del usuario, el token no queda marcado como usado
        with transaction.atomic():
            token_obj.used_at = timezone.now()
            token_obj.save(update_fields=["used_at"])

            user.set_password(new_password)
            user.save(update_fields=["password"])

        return Response(
            {"message": "Contraseña restablecida correctamente. Ya puedes iniciar sesión."},
            status=status.HTTP_200_OK,
        )
