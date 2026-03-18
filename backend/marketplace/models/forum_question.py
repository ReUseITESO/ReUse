from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone


class ForumQuestion(models.Model):
    user = models.ForeignKey(
        "core.User",
        on_delete=models.CASCADE,
        related_name="forum_questions",
    )
    product = models.ForeignKey(
        "marketplace.Products",
        on_delete=models.CASCADE,
        related_name="questions",
        blank=True,
        null=True,
        db_column="products_id",
    )
    post = models.ForeignKey(
        "social.CommunityPost",
        on_delete=models.CASCADE,
        related_name="questions",
        blank=True,
        null=True,
    )
    message = models.TextField()
    parent = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        related_name="replies",
        blank=True,
        null=True,
    )
    created_at = models.DateTimeField(default=timezone.now, editable=False)

    class Meta:
        ordering = ["created_at"]
        indexes = [
            models.Index(fields=["product"]),
            models.Index(fields=["post"]),
            models.Index(fields=["user"]),
            models.Index(fields=["parent"]),
        ]

    def clean(self):
        has_product = self.product_id is not None
        has_post = self.post_id is not None

        if has_product == has_post:
            raise ValidationError(
                "ForumQuestion must belong to exactly one target: product or post."
            )

        if self.parent_id and self.parent:
            if self.parent.product_id != self.product_id:
                raise ValidationError("Reply must belong to the same product thread.")
            if self.parent.post_id != self.post_id:
                raise ValidationError("Reply must belong to the same post thread.")

    def __str__(self) -> str:
        target = self.product.title if self.product_id else self.post.title
        return f"Question on {target} by {self.user.get_full_name()}"
