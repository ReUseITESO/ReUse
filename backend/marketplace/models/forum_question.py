from django.db import models


class ForumQuestion(models.Model):
    """Public Q&A thread on a product listing. Supports nested replies via parent."""

    user = models.ForeignKey(
        'core.User',
        on_delete=models.CASCADE,
        related_name="forum_questions",
        db_column="user_id",
    )
    product = models.ForeignKey(
        'marketplace.Products',
        on_delete=models.CASCADE,
        related_name="forum_questions",
        db_column="products_id",
    )
    message = models.TextField()
    parent = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name="replies",
        db_column="parent_id",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["product"]),
            models.Index(fields=["user"]),
            models.Index(fields=["parent"]),
        ]

    def __str__(self) -> str:
        return f"Question on {self.product.title} by {self.user.name}"