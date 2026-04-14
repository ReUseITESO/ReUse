from django.conf import settings
from django.db import models


class AccountReactivationToken(models.Model):
    """
    HU-CORE-17: Token one-time para reactivar una cuenta desactivada.
    Mismo patrón que EmailVerificationToken.
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="reactivation_tokens",
    )
    token_hash = models.CharField(max_length=64, unique=True)
    expires_at = models.DateTimeField()
    used_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "account_reactivation_tokens"
        indexes = [
            models.Index(fields=["user"], name="account_rea_user_id_c2169c_idx"),
            models.Index(fields=["token_hash"], name="account_rea_token_h_43afe9_idx"),
            models.Index(fields=["expires_at"], name="account_rea_expires_2eecf3_idx"),
        ]

    def __str__(self):
        return f"ReactivationToken for {self.user} (used={self.used_at is not None})"
