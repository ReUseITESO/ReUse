from django.db import models
from django.utils import timezone


class CommunityMember(models.Model):
    class Role(models.TextChoices):
        ADMIN = "admin", "Admin"
        MODERATOR = "moderator", "Moderator"
        MEMBER = "member", "Member"

    community = models.ForeignKey(
        "social.Community",
        on_delete=models.CASCADE,
        related_name="memberships",
        db_column="community_id",
    )
    user = models.ForeignKey(
        "core.User",
        on_delete=models.CASCADE,
        related_name="community_memberships",
        db_column="user_id",
    )
    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.MEMBER,
    )
    joined_at = models.DateTimeField(default=timezone.now, editable=False)

    class Meta:
        ordering = ["-joined_at"]
        indexes = [
            models.Index(fields=["community"]),
            models.Index(fields=["user"]),
            models.Index(fields=["community", "role"]),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["community", "user"],
                name="unique_social_community_member",
            ),
        ]

    def __str__(self):
        return f"{self.user.get_full_name()} @ {self.community.name} ({self.role})"
