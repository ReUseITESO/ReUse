from django.db import models


class UserChallenge(models.Model):
    user = models.ForeignKey(
        "core.User",
        on_delete=models.CASCADE,
        related_name="user_challenges",
    )
    challenge = models.ForeignKey(
        "gamification.Challenge",
        on_delete=models.CASCADE,
        related_name="participants",
    )
    progress = models.PositiveIntegerField(default=0)
    is_completed = models.BooleanField(default=False)
    reward_claimed = models.BooleanField(default=False)
    reward_claimed_at = models.DateTimeField(blank=True, null=True)
    joined_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-joined_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["user", "challenge"],
                name="unique_user_challenge",
            )
        ]

    def __str__(self):
        return f"{self.user.email} - {self.challenge.title}"
