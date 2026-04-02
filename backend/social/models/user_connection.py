from django.db import models
from django.utils import timezone


class UserConnection(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        ACCEPTED = "accepted", "Accepted"
        REJECTED = "rejected", "Rejected"
        BLOCKED = "blocked", "Blocked"

    requester = models.ForeignKey(
        "core.User",
        on_delete=models.CASCADE,
        related_name="sent_connections",
        db_column="requester_id",
    )
    addressee = models.ForeignKey(
        "core.User",
        on_delete=models.CASCADE,
        related_name="received_connections",
        db_column="addressee_id",
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    created_at = models.DateTimeField(default=timezone.now, editable=False)
    updated_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["requester"]),
            models.Index(fields=["addressee"]),
            models.Index(fields=["addressee", "status"]),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["requester", "addressee"],
                name="unique_social_connection_direction",
            ),
            models.CheckConstraint(
                check=~models.Q(requester=models.F("addressee")),
                name="social_userconnection_requester_not_addressee",
            ),
        ]

    def save(self, *args, **kwargs):
        if not self._state.adding:
            self.updated_at = timezone.now()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.requester.get_full_name()} -> {self.addressee.get_full_name()} ({self.status})"
