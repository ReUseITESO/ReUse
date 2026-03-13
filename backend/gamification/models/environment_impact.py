from django.db import models

from core.models.user import User


class EnvironmentImpact(models.Model):
    """Per-user environmental impact metrics (CO2 saved, products reused).

    This is a scaffolding model based on docs/database/erd_v1.md.
    The team can modify fields, constraints, and Meta options as needed.
    Remember to run makemigrations after changes.
    """

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="environment_impact",
        db_column="user_id",
    )
    kg_co2_saved = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    reused_products = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "environment_impact"
        ordering = ["-kg_co2_saved"]

    def __str__(self):
        return f"{self.user.get_full_name()}: {self.kg_co2_saved}kg CO2"
