from django.conf import settings
from django.db import models


class PasswordResetToken(models.Model):
    """
    HU-CORE-19: Token one-time para restablecer contraseña.
    Mismo patrón que AccountReactivationToken.
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="password_reset_tokens",
    )
    token_hash = models.CharField(max_length=64, unique=True)
    expires_at = models.DateTimeField()
    used_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "password_reset_tokens"
        indexes = [
            models.Index(fields=["user"], name="pwd_reset_user_idx"),
            models.Index(fields=["token_hash"], name="pwd_reset_token_hash_idx"),
            models.Index(fields=["expires_at"], name="pwd_reset_expires_idx"),
        ]

    def __str__(self):
        return f"PasswordResetToken for {self.user} (used={self.used_at is not None})"
