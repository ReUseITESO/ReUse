from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.core.validators import EmailValidator, RegexValidator
from django.db import models


class CustomUserManager(BaseUserManager):
    """Manager personalizado para User con email como USERNAME_FIELD"""

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('El email es requerido')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    """Miembros de la comunidad ITESO que usan la plataforma"""

    username = None
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
    phone = models.CharField(max_length=20, blank=True, default='')
    points = models.IntegerField(default=0)
    profile_picture = models.CharField(max_length=500, blank=True, null=True)

    # HU-CORE-09: email verification state
    is_email_verified = models.BooleanField(default=False)
    email_verified_at = models.DateTimeField(blank=True, null=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    objects = CustomUserManager()

    class Meta:
        db_table = 'users'
        ordering = ['-date_joined']

    def __str__(self):
        return f"{self.get_full_name()} ({self.email})"
