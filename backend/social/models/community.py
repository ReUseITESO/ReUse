from django.db import models
from django.utils import timezone


class Community(models.Model):
    creator = models.ForeignKey(
        "core.User",
        on_delete=models.RESTRICT,
        related_name="created_communities",
        db_column="creator_id",
    )
    name = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.CharField(max_length=500, blank=True, null=True)
    is_private = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now, editable=False)
    updated_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["creator"]),
            models.Index(fields=["is_active"]),
        ]

    def save(self, *args, **kwargs):
        if not self._state.adding:
            self.updated_at = timezone.now()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name
