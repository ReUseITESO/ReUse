from django.db import models

from marketplace.models.product import Products


class Images(models.Model):
    """Product images — one product can have multiple images with an order number.

    This is a scaffolding model based on docs/database/erd_v1.md.
    The team can modify fields, constraints, and Meta options as needed.
    Remember to run makemigrations after changes.
    """

    products = models.ForeignKey(
        Products,
        on_delete=models.CASCADE,
        related_name="images",
        db_column="products_id",
    )
    image_url = models.CharField(max_length=500)
    order_number = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "images"
        verbose_name_plural = "Images"
        unique_together = [["products", "order_number"]]
        ordering = ["products", "order_number"]
        indexes = [
            models.Index(fields=["products", "order_number"]),
        ]

    def __str__(self):
        return f"Image {self.order_number} of {self.products.title}"
