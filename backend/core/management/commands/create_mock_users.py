from django.core.management.base import BaseCommand

from core.models import User

MOCK_USERS = [
    {
        "email": "ana.garcia@iteso.mx",
        "name": "Ana García",
        "phone": "3312345678",
    },
    {
        "email": "carlos.lopez@iteso.mx",
        "name": "Carlos López",
        "phone": "3387654321",
    },
    {
        "email": "maria.torres@iteso.mx",
        "name": "María Torres",
        "phone": "3356781234",
    },
]


class Command(BaseCommand):
    help = "Create mock ITESO users for development"

    def handle(self, *args, **options):
        for user_data in MOCK_USERS:
            user, created = User.objects.get_or_create(
                email=user_data["email"],
                defaults=user_data,
            )
            status = "Created" if created else "Already exists"
            self.stdout.write(f"  {status}: {user}")

        self.stdout.write(self.style.SUCCESS("Mock users ready"))
