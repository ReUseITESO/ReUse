from django.db import models

from core.models.user import User
from gamification.models.badges import Badges


class UserBadges(models.Model):
    """Many-to-many relationship between users and earned badges.

    This is a scaffolding model based on docs/database/erd_v1.md.
    The team can modify fields, constraints, and Meta options as needed.
    Remember to run makemigrations after changes.
    """

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="user_badges",
        db_column="user_id",
    )
    badges = models.ForeignKey(
        Badges,
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
        return f"{self.user.name} - {self.badges.name}"
