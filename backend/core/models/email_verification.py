from django.conf import settings
from django.db import models


class EmailVerificationToken(models.Model):
    """
    One-time token for email verification.
    Stores only token_hash (sha256 hex), never the raw token.
    """

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="email_verification_tokens",
    )
    token_hash = models.CharField(max_length=64, unique=True)  # sha256 hex
    expires_at = models.DateTimeField()
    used_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "email_verification_tokens"
        indexes = [
            models.Index(fields=["user"]),
            models.Index(fields=["token_hash"]),
            models.Index(fields=["expires_at"]),
            models.Index(fields=["used_at"]),
        ]

    def __str__(self):
        used = self.used_at is not None
        return f"EmailVerificationToken(user_id={self.user_id}, used={used})"