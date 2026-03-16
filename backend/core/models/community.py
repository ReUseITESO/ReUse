from django.conf import settings
from django.db import models


class Community(models.Model):
    """A group of ITESO users organized around a shared interest."""

    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, default="")
    image_url = models.CharField(max_length=500, blank=True, null=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="created_communities",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "communities"
        verbose_name_plural = "Communities"
        ordering = ["-created_at"]

    def __str__(self):
        return self.name


class CommunityMembership(models.Model):
    """Membership of a user in a community with a role."""

    ROLE_CHOICES = [
        ("admin", "Admin"),
        ("member", "Member"),
    ]

    community = models.ForeignKey(
        Community, on_delete=models.CASCADE, related_name="memberships"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="community_memberships",
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default="member")
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "community_memberships"
        constraints = [
            models.UniqueConstraint(
                fields=["community", "user"],
                name="unique_community_membership",
            ),
        ]

    def __str__(self):
        return f"{self.user} in {self.community} ({self.role})"


class CommunityPost(models.Model):
    """A post published within a community by a member."""

    community = models.ForeignKey(
        Community, on_delete=models.CASCADE, related_name="posts"
    )
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="community_posts",
    )
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "community_posts"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Post by {self.author} in {self.community}"


class CommunityInvitation(models.Model):
    """Invitation to join a community sent by an admin."""

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("accepted", "Accepted"),
        ("declined", "Declined"),
    ]

    community = models.ForeignKey(
        Community, on_delete=models.CASCADE, related_name="invitations"
    )
    invited_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="sent_community_invitations",
    )
    invited_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="received_community_invitations",
    )
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "community_invitations"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Invite {self.invited_user} to {self.community} ({self.status})"
