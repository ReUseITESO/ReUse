from django.db import models
from django.utils import timezone


class CommunityPost(models.Model):
    community = models.ForeignKey(
        "social.Community",
        on_delete=models.CASCADE,
        related_name="posts",
    )
    user = models.ForeignKey(
        "core.User",
        on_delete=models.CASCADE,
        related_name="community_posts",
    )
    title = models.CharField(max_length=255)
    content = models.TextField()
    image_url = models.URLField(max_length=500, blank=True, null=True)
    is_pinned = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now, editable=False)
    updated_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ["-is_pinned", "-created_at"]
        indexes = [
            models.Index(fields=["community", "created_at"]),
            models.Index(fields=["user"]),
            models.Index(fields=["community", "is_pinned"]),
        ]

    def save(self, *args, **kwargs):
        if not self._state.adding:
            self.updated_at = timezone.now()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title