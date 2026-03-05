from django.db import models


class Category(models.Model):
    """Product categories"""

    name = models.CharField(max_length=100)
    icon = models.CharField(max_length=500, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name
