from django.db import models


class Badges(models.Model):
    """Achievement badges that users can earn.

    This is a scaffolding model based on docs/database/erd_v1.md.
    The team can modify fields, constraints, and Meta options as needed.
    Remember to run makemigrations after changes.
    """

    RARITY_CHOICES = [
        ("comun", "Común"),
        ("raro", "Raro"),
        ("epico", "Épico"),
        ("legendario", "Legendario"),
    ]

    name = models.CharField(max_length=100)
    description = models.TextField()
    icon_url = models.CharField(max_length=500)
    rarity = models.CharField(max_length=20, choices=RARITY_CHOICES)
    points = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "badges"
        verbose_name_plural = "Badges"
        ordering = ["rarity", "-points"]

    def __str__(self):
        return self.name
