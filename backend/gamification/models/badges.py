from django.db import models


class Badges(models.Model):
    """
    Model representing the badges available in the system.
    """
    name = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.CharField(max_length=255, blank=True, null=True)  # URL or icon name
    points = models.IntegerField(default=0)
    rarity = models.CharField(max_length=50, default="comun")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "badges"
        verbose_name_plural = "Badges"

    def __str__(self):
        return self.name
