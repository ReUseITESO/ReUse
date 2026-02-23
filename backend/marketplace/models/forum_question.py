from django.db import models

from core.models.user import User
from marketplace.models.product import Products


class ForumQuestion(models.Model):
    """Public Q&A thread on a product listing. Supports nested replies via parent_id.

    This is a scaffolding model based on docs/database/erd_v1.md.
    The team can modify fields, constraints, and Meta options as needed.
    Remember to run makemigrations after changes.
    """

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="forum_questions",
        db_column="user_id",
    )
    products = models.ForeignKey(
        Products,
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
        db_table = "forum_questions"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["products"]),
            models.Index(fields=["user"]),
            models.Index(fields=["parent"]),
        ]

    def __str__(self):
        return f"Question on {self.products.title} by {self.user.name}"
