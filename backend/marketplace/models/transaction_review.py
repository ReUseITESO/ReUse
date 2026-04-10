from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class TransactionReview(models.Model):
    transaction = models.ForeignKey(
        "marketplace.Transaction",
        on_delete=models.CASCADE,
        related_name="reviews",
    )
    reviewer = models.ForeignKey(
        "core.User",
        on_delete=models.CASCADE,
        related_name="reviews_given",
    )
    reviewee = models.ForeignKey(
        "core.User",
        on_delete=models.CASCADE,
        related_name="reviews_received",
    )
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
    )
    comment = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["transaction", "reviewer"],
                name="uq_transaction_review_reviewer",
            )
        ]
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return (
            f"Review by {self.reviewer_id} on tx {self.transaction_id}: {self.rating}/5"
        )
