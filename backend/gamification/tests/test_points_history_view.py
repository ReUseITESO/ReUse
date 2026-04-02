from datetime import timedelta

from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from core.models import User
from gamification.models.point_transaction import PointTransaction


class PointsHistoryViewTests(APITestCase):
    URL = "/api/gamification/points/history/"

    def setUp(self):
        self.user = User.objects.create(
            email="history.user@iteso.mx",
            first_name="History",
            last_name="User",
            points=100,
        )
        self.other_user = User.objects.create(
            email="other.user@iteso.mx",
            first_name="Other",
            last_name="User",
            points=50,
        )

        now = timezone.now()

        self.tx_old = PointTransaction.objects.create(
            user=self.user,
            action="publish_item",
            points=5,
            reference_id=101,
        )
        self.tx_new = PointTransaction.objects.create(
            user=self.user,
            action="complete_donation",
            points=15,
            reference_id=202,
        )
        self.tx_deduction = PointTransaction.objects.create(
            user=self.user,
            action="points_deduction",
            points=-3,
            reference_id=303,
        )

        PointTransaction.objects.filter(id=self.tx_old.id).update(
            created_at=now - timedelta(days=5)
        )
        PointTransaction.objects.filter(id=self.tx_new.id).update(
            created_at=now - timedelta(days=2)
        )
        PointTransaction.objects.filter(id=self.tx_deduction.id).update(
            created_at=now - timedelta(days=1)
        )

        self.tx_old.refresh_from_db()
        self.tx_new.refresh_from_db()
        self.tx_deduction.refresh_from_db()

        PointTransaction.objects.create(
            user=self.other_user,
            action="publish_item",
            points=99,
            reference_id=404,
        )

    def _auth(self):
        self.client.force_authenticate(user=self.user)

    def test_requires_authentication(self):
        response = self.client.get(self.URL)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_returns_paginated_history_for_current_user_only(self):
        self._auth()
        response = self.client.get(self.URL)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("count", response.data)
        self.assertIn("results", response.data)
        self.assertEqual(response.data["count"], 3)

        first_result = response.data["results"][0]
        self.assertIn("action", first_result)
        self.assertIn("action_display", first_result)
        self.assertIn("points", first_result)
        self.assertIn("created_at", first_result)
        self.assertIn("reference_id", first_result)
        self.assertIn("reference_type", first_result)
        self.assertIn("reference_label", first_result)

    def test_filters_by_action(self):
        self._auth()
        response = self.client.get(self.URL, {"action": "complete_donation"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["action"], "complete_donation")

    def test_filters_by_date_range(self):
        self._auth()
        response = self.client.get(
            self.URL,
            {
                "start_date": (timezone.now() - timedelta(days=3)).date().isoformat(),
                "end_date": timezone.now().date().isoformat(),
            },
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 2)

    def test_supports_ordering_by_points(self):
        self._auth()
        response = self.client.get(self.URL, {"ordering": "points"})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        points = [entry["points"] for entry in response.data["results"]]
        self.assertEqual(points, sorted(points))

    def test_returns_400_for_invalid_date_format(self):
        self._auth()
        response = self.client.get(self.URL, {"start_date": "03-18-2026"})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("date", response.data["error"]["details"])