from django.db import models
from django.core.validators import EmailValidator, RegexValidator


class User(models.Model):
    """Estudiantes ITESO que usan la plataforma"""

    email = models.EmailField(
        unique=True,
        validators=[
            EmailValidator(),
            RegexValidator(
                regex=r'^[^@]+@iteso\.mx$',
                message='Email debe ser del dominio @iteso.mx'
            )
        ]
    )
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    points = models.IntegerField(default=0)
    profile_picture = models.CharField(max_length=500, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'users'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.name} ({self.email})"
