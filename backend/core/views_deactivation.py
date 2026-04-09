"""
HU-CORE-17: Account deactivation / reactivation views.
Kept separate from views.py to avoid merge conflicts with other teams.
"""
import hashlib
import secrets
from datetime import timedelta

from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

from .models.account_reactivation_token import AccountReactivationToken
from django.contrib.auth import get_user_model

User = get_user_model()

REACTIVATION_EXPIRES_MINUTES = 60


def _hash_token(raw: str) -> str:
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


class AccountDeactivateView(APIView):
    """
    POST /api/auth/account/deactivate/
    Desactiva lógicamente la cuenta del usuario autenticado.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        user.is_deactivated = True
        user.deactivated_at = timezone.now()
        user.save(update_fields=["is_deactivated", "deactivated_at"])

        return Response(
            {"message": "Cuenta desactivada correctamente."},
            status=status.HTTP_200_OK,
        )


class AccountReactivateSendView(APIView):
    """
    POST /api/auth/account/reactivate/send/
    Envía email con enlace de reactivación. Respuesta genérica para no filtrar existencia.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        email = (request.data.get("email") or "").strip().lower()
        generic = {"message": "Si la cuenta existe, recibirás un correo de reactivación."}

        if not email:
            return Response(generic, status=status.HTTP_200_OK)

        user = User.objects.filter(email=email).first()
        if not user or not getattr(user, "is_deactivated", False):
            return Response(generic, status=status.HTTP_200_OK)

        raw_token = secrets.token_urlsafe(32)
        token_hash = _hash_token(raw_token)
        expires_at = timezone.now() + timedelta(minutes=REACTIVATION_EXPIRES_MINUTES)

        AccountReactivationToken.objects.create(
            user=user,
            token_hash=token_hash,
            expires_at=expires_at,
        )

        frontend_base = getattr(settings, "FRONTEND_BASE_URL", "http://localhost:3000")
        reactivate_url = f"{frontend_base}/auth/reactivate?token={raw_token}"

        send_mail(
            subject="Reactiva tu cuenta - ReUseITESO",
            message=(
                "Hemos recibido una solicitud para reactivar tu cuenta.\n\n"
                f"Haz clic en el siguiente enlace para reactivarla:\n{reactivate_url}\n\n"
                f"Este enlace expira en {REACTIVATION_EXPIRES_MINUTES} minutos.\n\n"
                "Si no solicitaste esto, ignora este mensaje."
            ),
            from_email=getattr(settings, "DEFAULT_FROM_EMAIL", "no-reply@reuse.com"),
            recipient_list=[user.email],
            fail_silently=False,
        )

        return Response(generic, status=status.HTTP_200_OK)


class AccountReactivateConfirmView(APIView):
    """
    GET /api/auth/account/reactivate/confirm/?token=...
    Confirma el token y reactiva la cuenta.
    """

    permission_classes = [AllowAny]

    def get(self, request):
        raw_token = (request.query_params.get("token") or "").strip()

        if not raw_token:
            return Response(
                {"error": {"code": "TOKEN_MISSING", "message": "Token faltante."}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        token_hash = _hash_token(raw_token)
        token_obj = (
            AccountReactivationToken.objects.select_related("user")
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
                {"error": {"code": "TOKEN_USED", "message": "Token ya fue usado."}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if timezone.now() >= token_obj.expires_at:
            return Response(
                {"error": {"code": "TOKEN_EXPIRED", "message": "Token expirado."}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = token_obj.user

        token_obj.used_at = timezone.now()
        token_obj.save(update_fields=["used_at"])

        user.is_deactivated = False
        user.deactivated_at = None
        user.save(update_fields=["is_deactivated", "deactivated_at"])

        return Response(
            {
                "message": "Cuenta reactivada correctamente. Ya puedes iniciar sesión.",
                "email": user.email,
            },
            status=status.HTTP_200_OK,
        )
