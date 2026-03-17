from datetime import timedelta

from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from core.models import User
from gamification.models import (
    Challenge,
    ChallengeType,
    PointAction,
    PointTransaction,
    UserChallenge,
)
from marketplace.models import Category, Products, Transaction


class ChallengeAPITest(APITestCase):
    CHALLENGES_URL = "/api/gamification/challenges/"
    MY_CHALLENGES_URL = "/api/gamification/challenges/me/"

    def setUp(self):
        self.user = User.objects.create(
            email="challenge.user@iteso.mx",
            first_name="Challenge",
            last_name="Tester",
            points=0,
        )
        self.other_user = User.objects.create(
            email="other.user@iteso.mx",
            first_name="Other",
            last_name="User",
            points=0,
        )
        self.category = Category.objects.create(name="Electronics")

        now = timezone.now()
        self.active_challenge = Challenge.objects.create(
            title="Donate 2 items this week",
            description="Complete two donation transactions.",
            challenge_type=ChallengeType.DONATION,
            goal=2,
            bonus_points=20,
            start_date=now - timedelta(days=1),
            end_date=now + timedelta(days=7),
            is_active=True,
        )
        self.inactive_challenge = Challenge.objects.create(
            title="Expired challenge",
            description="Should not appear in active list.",
            challenge_type=ChallengeType.EXCHANGE,
            goal=3,
            bonus_points=15,
            start_date=now - timedelta(days=10),
            end_date=now - timedelta(days=3),
            is_active=True,
        )

    def _auth(self):
        self.client.force_authenticate(user=self.user)

    def _create_transaction(self, *, transaction_type):
        product = Products.objects.create(
            seller=self.user,
            category=self.category,
            title=f"Item {timezone.now().timestamp()}",
            description="Reusable item",
            condition="usado",
            transaction_type=transaction_type,
            status="completado",
            price=10 if transaction_type == "sale" else None,
        )
        return Transaction.objects.create(
            product=product,
            seller=self.user,
            buyer=self.other_user,
            transaction_type=transaction_type,
            delivery_location="ITESO",
            status="completada",
        )

    def test_list_challenges_requires_auth_returns_401(self):
        response = self.client.get(self.CHALLENGES_URL)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_challenges_returns_active_challenges(self):
        self._auth()

        response = self.client.get(self.CHALLENGES_URL)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["id"], self.active_challenge.id)
        self.assertFalse(response.data[0]["joined"])

    def test_join_challenge_creates_user_challenge(self):
        self._auth()

        response = self.client.post(
            f"/api/gamification/challenges/{self.active_challenge.id}/join/"
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(
            UserChallenge.objects.filter(
                user=self.user,
                challenge=self.active_challenge,
            ).exists()
        )

    def test_join_challenge_twice_returns_400(self):
        self._auth()
        self.client.post(
            f"/api/gamification/challenges/{self.active_challenge.id}/join/"
        )

        response = self.client.post(
            f"/api/gamification/challenges/{self.active_challenge.id}/join/"
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_my_challenges_refreshes_progress_and_awards_bonus_once(self):
        self._auth()
        self.client.post(
            f"/api/gamification/challenges/{self.active_challenge.id}/join/"
        )

        self._create_transaction(transaction_type="donation")
        self._create_transaction(transaction_type="donation")

        response = self.client.get(self.MY_CHALLENGES_URL)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["progress"], 2)
        self.assertTrue(response.data[0]["is_completed"])

        self.user.refresh_from_db()
        self.assertEqual(self.user.points, 20)
        self.assertEqual(
            PointTransaction.objects.filter(
                user=self.user,
                action="challenge_completion",
                reference_id=self.active_challenge.id,
            ).count(),
            1,
        )

        second_response = self.client.get(self.MY_CHALLENGES_URL)
        self.assertEqual(second_response.status_code, status.HTTP_200_OK)

        self.user.refresh_from_db()
        self.assertEqual(self.user.points, 20)
        self.assertEqual(
            PointTransaction.objects.filter(
                user=self.user,
                action="challenge_completion",
                reference_id=self.active_challenge.id,
            ).count(),
            1,
        )

    def test_my_challenges_uses_point_transactions_for_progress(self):
        self._auth()
        self.client.post(
            f"/api/gamification/challenges/{self.active_challenge.id}/join/"
        )

        PointTransaction.objects.create(
            user=self.user,
            action=PointAction.COMPLETE_DONATION,
            points=10,
        )

        response = self.client.get(self.MY_CHALLENGES_URL)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]["progress"], 1)
        self.assertFalse(response.data[0]["is_completed"])
