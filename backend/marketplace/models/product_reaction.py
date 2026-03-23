from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone


class ProductReaction(models.Model):
    REACTION_CHOICES = [
        ("like", "Like"),
        ("dislike", "Dislike"),
    ]

    product = models.ForeignKey(
        "marketplace.Products",
        on_delete=models.CASCADE,
        related_name="reactions",
    )
    user = models.ForeignKey(
        "core.User",
        on_delete=models.CASCADE,
        related_name="reactions",
    )
    type = models.CharField(max_length=10, choices=REACTION_CHOICES)
    created_at = models.DateTimeField(default=timezone.now, editable=False)

    class Meta:
        db_table = "marketplace_productreaction"
        constraints = [
            models.UniqueConstraint(
                fields=["product", "user"],
                name="uq_productreaction_product_user",
            )
        ]
        indexes = [
            models.Index(fields=["product", "type"], name="idx_pr_product_type"),
            models.Index(fields=["user"], name="idx_pr_user"),
        ]

    def clean(self):
        if self.product_id and self.user_id and self.product.seller_id == self.user_id:
            raise ValidationError("A user cannot react to their own product.")

    def __str__(self):
        return f"{self.user} {self.type}d {self.product}"
