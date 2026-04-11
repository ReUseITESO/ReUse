from django.core.management.base import BaseCommand

from gamification.models.badges import Badges


class Command(BaseCommand):
    help = "Seed initial badges for milestones"

    def handle(self, *args, **kwargs):
        badges_data = [
            {
                "name": "Primer Artículo",
                "description": "Publicaste tu primer artículo en ReUse ITESO.",
                "icon": "first_item",
                "points": 10,
                "rarity": "comun",
            },
            {
                "name": "Donador Constante",
                "description": "Has completado 5 donaciones.",
                "icon": "five_donations",
                "points": 50,
                "rarity": "raro",
            },
            {
                "name": "Comerciante Frecuente",
                "description": "Has completado 10 transacciones totales.",
                "icon": "ten_transactions",
                "points": 100,
                "rarity": "epico",
            },
            {
                "name": "Primer Intercambio",
                "description": "Realizaste tu primer intercambio.",
                "icon": "first_exchange",
                "points": 20,
                "rarity": "comun",
            },
            {
                "name": "Centurión de Puntos",
                "description": "Has acumulado más de 100 puntos en total.",
                "icon": "hundred_points",
                "points": 0,
                "rarity": "legendario",
            },
        ]

        for b_data in badges_data:
            obj, created = Badges.objects.get_or_create(
                name=b_data["name"],
                defaults={
                    "description": b_data["description"],
                    "icon": b_data["icon"],
                    "points": b_data["points"],
                    "rarity": b_data["rarity"],
                },
            )
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'Successfully created badge "{obj.name}"')
                )
            else:
                self.stdout.write(f'Badge "{obj.name}" already exists.')
