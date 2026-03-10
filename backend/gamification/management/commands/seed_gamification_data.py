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


def build_default_challenges(now):
    return [
        {
            "title": "Donate 3 items this week",
            "description": "Complete 3 donation actions this week.",
            "challenge_type": ChallengeType.DONATION,
            "goal": 3,
            "bonus_points": 30,
            "start_date": now - timedelta(days=1),
            "end_date": now + timedelta(days=7),
            "is_active": True,
        },
        {
            "title": "Complete 5 exchanges this month",
            "description": "Complete 5 exchange actions this month.",
            "challenge_type": ChallengeType.EXCHANGE,
            "goal": 5,
            "bonus_points": 50,
            "start_date": now - timedelta(days=2),
            "end_date": now + timedelta(days=30),
            "is_active": True,
        },
        {
            "title": "Publish 4 items this month",
            "description": "Publish 4 items before the month ends.",
            "challenge_type": ChallengeType.PUBLISH,
            "goal": 4,
            "bonus_points": 25,
            "start_date": now - timedelta(days=3),
            "end_date": now + timedelta(days=30),
            "is_active": True,
        },
        {
            "title": "Complete 2 sales this month",
            "description": "Complete 2 sale actions this month.",
            "challenge_type": ChallengeType.SALE,
            "goal": 2,
            "bonus_points": 35,
            "start_date": now - timedelta(days=3),
            "end_date": now + timedelta(days=30),
            "is_active": True,
        },
        {
            "title": "Get 5 positive reviews",
            "description": "Receive 5 positive review actions.",
            "challenge_type": ChallengeType.REVIEW,
            "goal": 5,
            "bonus_points": 20,
            "start_date": now - timedelta(days=3),
            "end_date": now + timedelta(days=30),
            "is_active": True,
        },
    ]


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
        for payload in build_default_challenges(now):
            challenge, created = Challenge.objects.update_or_create(
                title=payload["title"],
                defaults=payload,
            )
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f"Challenge created: {challenge.title}")
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f"Challenge updated: {challenge.title}")
                )

        self.stdout.write(self.style.SUCCESS("Gamification seed completed."))
