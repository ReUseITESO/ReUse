from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

from gamification.models import Challenge, ChallengeType, PointAction, PointRule

DEFAULT_POINT_RULES = {
    PointAction.PUBLISH_ITEM: 5,
    PointAction.COMPLETE_DONATION: 12,
    PointAction.COMPLETE_SALE: 15,
    PointAction.COMPLETE_EXCHANGE: 14,
    PointAction.RECEIVE_POSITIVE_REVIEW: 3,
}

CHALLENGE_BLUEPRINTS = {
    ChallengeType.DONATION: {
        "label": "Donation",
        "description": "Complete donation actions and keep useful items in circulation.",
    },
    ChallengeType.EXCHANGE: {
        "label": "Exchange",
        "description": "Complete exchange actions and keep the reuse loop active.",
    },
    ChallengeType.PUBLISH: {
        "label": "Publish",
        "description": "Publish items consistently to keep the marketplace fresh.",
    },
    ChallengeType.SALE: {
        "label": "Sale",
        "description": "Close sales and move items to the right hands.",
    },
    ChallengeType.REVIEW: {
        "label": "Review",
        "description": "Earn positive reviews through solid marketplace interactions.",
    },
}

TIME_LABELS = {
    "daily": "hoy",
    "weekly": "esta semana",
    "monthly": "este mes",
}

CHALLENGE_ACTIONS = {
    ChallengeType.DONATION: [
        "Dona",
        "Rescata",
        "Comparte",
        "Entrega",
    ],
    ChallengeType.EXCHANGE: [
        "Intercambia",
        "Conecta",
        "Consigue",
        "Cierra",
    ],
    ChallengeType.PUBLISH: [
        "Publica",
        "Sube",
        "Lanza",
        "Activa",
    ],
    ChallengeType.SALE: [
        "Vende",
        "Concreta",
        "Finaliza",
        "Mueve",
    ],
    ChallengeType.REVIEW: [
        "Obtén",
        "Gana",
        "Acumula",
        "Logra",
    ],
}

CHALLENGE_OBJECTS = {
    ChallengeType.DONATION: "donaciones",
    ChallengeType.EXCHANGE: "intercambios",
    ChallengeType.PUBLISH: "publicaciones",
    ChallengeType.SALE: "ventas",
    ChallengeType.REVIEW: "reseñas positivas",
}

CHALLENGE_IMPACTS = {
    ChallengeType.DONATION: [
        "Ayuda a que más productos sigan en uso dentro del campus.",
        "Evita que objetos útiles terminen en la basura.",
        "Impulsa una comunidad más solidaria y circular.",
    ],
    ChallengeType.EXCHANGE: [
        "Conecta con otros estudiantes y reutiliza mejor lo que ya existe.",
        "Reduce compras nuevas con trueques inteligentes.",
        "Mantén activos los intercambios en la comunidad ITESO.",
    ],
    ChallengeType.PUBLISH: [
        "Mantén fresco el catálogo con artículos útiles.",
        "Haz que más personas encuentren lo que necesitan.",
        "Aumenta la visibilidad de productos reutilizables.",
    ],
    ChallengeType.SALE: [
        "Haz circular artículos que ya no usas.",
        "Dale salida a productos con buen valor para otros.",
        "Mueve inventario real de manera sostenible.",
    ],
    ChallengeType.REVIEW: [
        "Construye confianza con transacciones de calidad.",
        "Fortalece tu reputación en la comunidad.",
        "Mejora la experiencia de compra e intercambio.",
    ],
}

CHALLENGE_CONTEXTS = [
    "material académico",
    "ropa y accesorios",
    "artículos de tecnología",
    "productos para el hogar",
    "herramientas y utilitarios",
]

BUCKET_SPECS = (
    {
        "key": "daily",
        "label": "Daily",
        "count": 20,
        "duration": timedelta(days=1, hours=4),
        "start_offset": timedelta(hours=6),
        "goal_base": 1,
        "goal_step": 1,
        "bonus_base": 12,
        "bonus_step": 4,
    },
    {
        "key": "weekly",
        "label": "Weekly",
        "count": 20,
        "duration": timedelta(days=7, hours=6),
        "start_offset": timedelta(days=1),
        "goal_base": 3,
        "goal_step": 1,
        "bonus_base": 24,
        "bonus_step": 5,
    },
    {
        "key": "monthly",
        "label": "Monthly",
        "count": 20,
        "duration": timedelta(days=30, hours=8),
        "start_offset": timedelta(days=2),
        "goal_base": 6,
        "goal_step": 2,
        "bonus_base": 44,
        "bonus_step": 6,
    },
)


def build_challenge_catalog(now):
    challenges = []
    type_items = list(CHALLENGE_BLUEPRINTS.items())

    for type_index, (challenge_type, _blueprint) in enumerate(type_items):
        for bucket in BUCKET_SPECS:
            for item_index in range(bucket["count"]):
                goal = bucket["goal_base"] + bucket["goal_step"] * item_index + type_index
                bonus_points = bucket["bonus_base"] + bucket["bonus_step"] * item_index + type_index * 2
                start_date = now - bucket["start_offset"] - timedelta(hours=item_index * 2 + type_index)
                end_date = start_date + bucket["duration"]
                action = CHALLENGE_ACTIONS[challenge_type][item_index % len(CHALLENGE_ACTIONS[challenge_type])]
                object_name = CHALLENGE_OBJECTS[challenge_type]
                impact = CHALLENGE_IMPACTS[challenge_type][item_index % len(CHALLENGE_IMPACTS[challenge_type])]
                context = CHALLENGE_CONTEXTS[(item_index + type_index) % len(CHALLENGE_CONTEXTS)]
                time_label = TIME_LABELS[bucket["key"]]

                title = f"{action} {goal} {object_name} {time_label}"
                description = (
                    f"{impact} Enfócate en {context} y completa {goal} {object_name} durante "
                    f"el periodo {bucket['label'].lower()}."
                )

                challenges.append(
                    {
                        "title": title,
                        "description": description,
                        "challenge_type": challenge_type,
                        "goal": goal,
                        "bonus_points": bonus_points,
                        "start_date": start_date,
                        "end_date": end_date,
                        "is_active": True,
                    }
                )

    return challenges


class Command(BaseCommand):
    help = "Seed default point rules and gamification challenges"

    def handle(self, *args, **kwargs):
        for action, points in DEFAULT_POINT_RULES.items():
            _, created = PointRule.objects.update_or_create(
                action=action,
                defaults={"points": points, "is_active": True},
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"Point rule created: {action}"))
            else:
                self.stdout.write(self.style.WARNING(f"Point rule updated: {action}"))

        now = timezone.now()
        catalog = build_challenge_catalog(now)

        # Hard reset challenge catalog to avoid mixing old challenge sets.
        Challenge.objects.all().delete()

        for payload in catalog:
            challenge = Challenge.objects.create(
                **payload,
            )
            self.stdout.write(self.style.SUCCESS(f"Challenge created: {challenge.title}"))

        self.stdout.write(
            self.style.SUCCESS(f"Gamification seed completed with {len(catalog)} challenges.")
        )
