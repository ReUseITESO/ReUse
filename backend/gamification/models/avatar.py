from django.db import models
from django.conf import settings

class Avatar(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE, 
        related_name="avatar",
    )
    image=models.CharField(max_length=512, null=True, blank=True)
    border_color=models.CharField(max_length=7, default="#000A9A")  # Hex color code
    border_thickness=models.IntegerField(default=20)  # Thickness in pixels
    zoom_level=models.FloatField(default=1.0)  # Zoom level (1.
    offset_x=models.FloatField(default=-120)  # Horizontal offset in pixels
    offset_y=models.FloatField(default=0)  # Vertical offset in pixels
    shadow_color=models.CharField(max_length=7, default="#4600A9")  # Hex color code
    shadow_thickness=models.IntegerField(default=0)  # Thickness in pixels