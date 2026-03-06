from django.core.management.base import BaseCommand

from core.models import User

MOCK_USERS = [
    {
        "email": "ana.garcia@iteso.mx",
        "name": "Ana García",
        "phone": "3312345678",
        "points": 120,
        "profile_picture": "https://randomuser.me/api/portraits/women/1.jpg",
    },
    {
        "email": "carlos.lopez@iteso.mx",
        "name": "Carlos López",
        "phone": "3387654321",
        "points": 80,
        "profile_picture": "https://randomuser.me/api/portraits/men/2.jpg",
    },
    {
        "email": "maria.torres@iteso.mx",
        "name": "María Torres",
        "phone": "3356781234",
        "points": 200,
        "profile_picture": "https://randomuser.me/api/portraits/women/3.jpg",
    },
]


class Command(BaseCommand):
    help = "Create mock ITESO users for development"

    def handle(self, *args, **options):
        for user_data in MOCK_USERS:
            # Ensure all required fields are set, including username=email
            user_defaults = user_data.copy()
            user_defaults["username"] = user_data["email"]
            user, created = User.objects.get_or_create(
                email=user_data["email"],
                defaults=user_defaults,
            )
            status = "Created" if created else "Already exists"
            self.stdout.write(f"  {status}: {user}")

        self.stdout.write(self.style.SUCCESS("Mock users ready"))
