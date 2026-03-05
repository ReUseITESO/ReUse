from django.core.exceptions import ValidationError
from django.db import models

from .category import Category


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
    title = models.CharField(max_length=255)
    description = models.TextField()
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES)
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPE_CHOICES)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="disponible"
    )
    price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    image_url = models.CharField(max_length=500, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Products"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["seller"]),
            models.Index(fields=["category"]),
            models.Index(fields=["status"]),
            models.Index(fields=["status", "category"], name="idx_products_available"),
        ]

    def clean(self):
        if self.transaction_type == "donation" and self.price is not None:
            raise ValidationError("Donations must not have a price")
        if self.transaction_type == "sale" and (self.price is None or self.price <= 0):
            raise ValidationError("Sales must have a price greater than 0")

    def __str__(self):
        return self.title
