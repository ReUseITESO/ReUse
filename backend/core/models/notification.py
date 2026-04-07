from django.db import models
from django.db.models import Q
from django.utils import timezone


class Notification(models.Model):
    TYPE_CHOICES = [
        ("badge_earned", "Badge Earned"),
        ("points_added", "Points Added"),
        ("transaction_confirmed", "Transaction Confirmed"),
        ("product_reported", "Product Reported"),
        ("new_reaction", "New Reaction"),
    ]

    user = models.ForeignKey(
        "core.User",
        on_delete=models.CASCADE,
        related_name="notifications",
    )
    type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    title = models.CharField(max_length=255)
    body = models.TextField(blank=True, null=True)
    reference_id = models.IntegerField(blank=True, null=True)
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now, editable=False)

    class Meta:
        db_table = "core_notification"
        indexes = [
            models.Index(
                fields=["user", "is_read"],
                name="idx_notif_user_unread",
                condition=Q(is_read=False),
            )
        ]

    def __str__(self):
        return f"Notification({self.type}) for {self.user}"
