from django.db import models


class Images(models.Model):
    """Product images — one product can have multiple images with an order number."""

    product = models.ForeignKey(
        'marketplace.Products',
        on_delete=models.CASCADE,
        related_name="images",
        db_column="products_id",
    )
    image_url = models.CharField(max_length=500)
    order_number = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Images"
        unique_together = [["product", "order_number"]]
        ordering = ["product", "order_number"]
        indexes = [
            models.Index(fields=["product", "order_number"]),
        ]

    def __str__(self) -> str:
        return f"Image {self.order_number} of {self.product.title}"
