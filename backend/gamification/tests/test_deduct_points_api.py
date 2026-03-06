from rest_framework.test import APITestCase

from core.models import User


class DeductPointsAPITest(APITestCase):

    def setUp(self):

        self.user = User.objects.create(
            username="testuser",
            points=10
        )

    def test_deduct_points(self):

        response = self.client.post(
            "/api/gamification/deduct-points/",
            {
                "user_id": self.user.id,
                "points": 5
            },
            format="json"
        )

        self.assertEqual(response.status_code, 200)

        self.user.refresh_from_db()

        self.assertEqual(self.user.points, 5)