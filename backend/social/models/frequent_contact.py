from django.db import models
from django.utils import timezone


class FrequentContact(models.Model):
    user = models.ForeignKey(
        "core.User",
        on_delete=models.CASCADE,
        related_name="frequent_contacts",
        db_column="user_id",
    )
    contact = models.ForeignKey(
        "core.User",
        on_delete=models.CASCADE,
        related_name="marked_as_frequent_by",
        db_column="contact_id",
    )
    created_at = models.DateTimeField(default=timezone.now, editable=False)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["user"]),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["user", "contact"],
                name="unique_social_frequent_contact",
            ),
            models.CheckConstraint(
                check=~models.Q(user=models.F("contact")),
                name="social_frequentcontact_user_not_contact",
            ),
        ]

    def __str__(self):
        return f"{self.user.get_full_name()} -> {self.contact.get_full_name()}"
