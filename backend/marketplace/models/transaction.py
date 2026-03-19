from django.core.exceptions import ValidationError
from django.db import models


class Transaction(models.Model):
    """Marketplace transaction between a buyer and a seller for a product."""

    STATUS_CHOICES = [
        ("pendiente", "Pending"),
        ("confirmada", "Confirmed"),
        ("completada", "Completed"),
        ("cancelada", "Cancelled"),
    ]

    TRANSACTION_TYPE_CHOICES = [
        ("donation", "Donation"),
        ("sale", "Sale"),
        ("swap", "Swap"),
    ]

    product = models.OneToOneField(
        "marketplace.Products",
        on_delete=models.CASCADE,
        related_name="transaction",
        db_column="products_id",
    )
    seller = models.ForeignKey(
        "core.User",
        on_delete=models.RESTRICT,
        related_name="transactions_selling",
        db_column="seller_id",
    )
    buyer = models.ForeignKey(
        "core.User",
        on_delete=models.RESTRICT,
        related_name="transactions_buying",
        db_column="buyer_id",
    )
    transaction_type = models.CharField(max_length=20, choices=TRANSACTION_TYPE_CHOICES)
    seller_confirmation = models.BooleanField(default=False)
    seller_confirmed_at = models.DateTimeField(blank=True, null=True)
    buyer_confirmation = models.BooleanField(default=False)
    buyer_confirmed_at = models.DateTimeField(blank=True, null=True)
    delivery_date = models.DateTimeField(blank=True, null=True)
    delivery_location = models.CharField(max_length=255)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default="pendiente"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["seller"]),
            models.Index(fields=["buyer"]),
        ]

    def clean(self):
        if self.seller_id and self.buyer_id and self.seller_id == self.buyer_id:
            raise ValidationError("Seller and buyer cannot be the same person")

    def __str__(self) -> str:
        return f"Transaction {self.id}: {self.product.title}"
