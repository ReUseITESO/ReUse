from django.db import models

class Avatar(models.Model):
    user=models.OneToOneField('auth.User', on_delete=models.CASCADE, related_name='avatar')
    image=models.ImageField(upload_to='avatars/')
    border_color=models.CharField(max_length=7, default='#000000')  # Hex color code
    border_thickness=models.IntegerField(default=0)  # Thickness in pixels
    zoom_level=models.FloatField(default=1.0)  # Zoom level (1.
    offset_x=models.IntegerField(default=0)  # Horizontal offset in pixels
    offset_y=models.IntegerField(default=0)  # Vertical offset in pixels
    shadow_color=models.CharField(max_length=7, default='#000000')  # Hex color code
    shadow_thickness=models.IntegerField(default=0)  # Thickness in pixels