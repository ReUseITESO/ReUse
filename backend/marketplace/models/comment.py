from django.db import models
from django.utils import timezone


class Comment(models.Model):
    """Public comment left by any authenticated user on a marketplace product."""

    product = models.ForeignKey(
        "marketplace.Products",
        on_delete=models.CASCADE,
        related_name="comments",
        db_column="product_id",
    )
    author = models.ForeignKey(
        "core.User",
        on_delete=models.CASCADE,
        related_name="marketplace_comments",
        db_column="author_id",
    )
    content = models.CharField(max_length=500)
    created_at = models.DateTimeField(default=timezone.now, editable=False)

    class Meta:
        ordering = ["created_at"]
        indexes = [
            models.Index(
                fields=["product", "created_at"],
                name="idx_comment_product_created",
            ),
        ]

    def __str__(self) -> str:
        return f"Comment by {self.author.get_full_name()} on {self.product.title}"
