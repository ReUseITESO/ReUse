from django.contrib.auth.models import AbstractUser
from django.core.validators import EmailValidator, RegexValidator
from django.db import models


class User(AbstractUser):
    """ITESO students using the platform"""

    name = models.CharField(max_length=255, default="")
    phone = models.CharField(max_length=20, default="")
    points = models.IntegerField(default=0)
    profile_picture = models.CharField(max_length=500, blank=True, null=True)

    email = models.EmailField(
        unique=True,
        validators=[
            EmailValidator(),
            RegexValidator(
                regex=r"^[^@]+@iteso\.mx$",
                message="Email must be from @iteso.mx domain",
            ),
        ],
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username", "name", "phone"]

    class Meta:
        db_table = "users"

    def __str__(self):
        return f"{self.name} ({self.email})"
