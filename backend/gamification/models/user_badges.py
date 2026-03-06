from django.db import models
from core.models.user import User

class UserBadges(models.Model):
    """Many-to-many relationship between users and earned badges."""

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="user_badges",
        db_column="user_id",
    )
    # Referencia por string para evitar Circular Import
    badges = models.ForeignKey(
        'gamification.Badges',
        on_delete=models.CASCADE,
        related_name="user_badges",
        db_column="badges_id",
    )
    earned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "user_badges"
        unique_together = [["user", "badges"]]
        ordering = ["-earned_at"]
        indexes = [
            models.Index(fields=["user"]),
        ]

    def __str__(self):
        return f"{self.user.username} - {self.badges.name}"