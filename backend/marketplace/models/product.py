from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone

from .category import Category
from social.models import Community


class Products(models.Model):
    """Products listed in the marketplace"""

    CONDITION_CHOICES = [
        ("nuevo", "New"),
        ("como_nuevo", "Like New"),
        ("buen_estado", "Good Condition"),
        ("usado", "Used"),
    ]

    TRANSACTION_TYPE_CHOICES = [
        ("donation", "Donation"),
        ("sale", "Sale"),
        ("swap", "Swap"),
    ]

    STATUS_CHOICES = [
        ("disponible", "Available"),
        ("pausado", "Paused"),
        ("en_proceso", "In Progress"),
        ("completado", "Completed"),
        ("cancelado", "Cancelled"),
    ]

    seller = models.ForeignKey(
        "core.User",
        on_delete=models.RESTRICT,
        related_name="products_selling",
        db_column="seller_id",
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.RESTRICT,
        related_name="products",
        db_column="category_id",
    )
    community = models.ForeignKey(
        Community,
        on_delete=models.SET_NULL,
        related_name="marketplace_items",
        db_column="community_id",
        null=True,
        blank=True,
        help_text="If set, this item is only visible to community members. If null, item is public.",
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES)
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPE_CHOICES)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="disponible"
    )
    price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now, editable=False)
    updated_at = models.DateTimeField(default=timezone.now)

    class Meta:
        verbose_name_plural = "Products"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["seller"]),
            models.Index(fields=["category"]),
            models.Index(fields=["status"]),
            models.Index(fields=["status", "category"], name="idx_products_available"),
            models.Index(fields=["community"]),
            models.Index(fields=["community", "status"], name="idx_comm_prod_avail"),
        ]

    def clean(self):
        if self.transaction_type == "donation" and self.price is not None:
            raise ValidationError("Donations must not have a price")
        if self.transaction_type == "sale" and (self.price is None or self.price <= 0):
            raise ValidationError("Sales must have a price greater than 0")

    def save(self, *args, **kwargs):
        if not self._state.adding:
            self.updated_at = timezone.now()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title
