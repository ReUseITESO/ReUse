import random

from django.core.management.base import BaseCommand

from core.models.user import User


class Command(BaseCommand):
    help = "Crea usuarios mock para pruebas de gamification."

    def handle(self, *args, **kwargs):
        for i in range(1, 11):
            email = f"mockuser{i}@iteso.mx"
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    "username": email,
                    "name": f"Mock User {i}",
                    "phone": f"33123456{i:02d}",
                    "points": random.randint(0, 1000),
                    "is_active": True,
                },
            )
            if created:
                user.set_password("mockpass123")
                user.save()
                self.stdout.write(
                    self.style.SUCCESS(f"Usuario mock creado: {user.email}")
                )
            else:
                self.stdout.write(f"Usuario mock ya existe: {user.email}")
        self.stdout.write(self.style.SUCCESS("Carga de usuarios mock finalizada."))
