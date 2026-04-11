from rest_framework.test import APITestCase

from core.models import User


class DeductPointsAPITest(APITestCase):
    def setUp(self):

        self.user = User.objects.create(
            email="test.user@iteso.mx", first_name="Test", last_name="User", points=10
        )

        self.client.force_authenticate(user=self.user)

    def test_deduct_points(self):

        response = self.client.post(
            "/api/gamification/deduct-points/",
            {"user_id": self.user.id, "points": 5},
            format="json",
        )

        self.assertEqual(response.status_code, 200)

        self.user.refresh_from_db()

        self.assertEqual(self.user.points, 5)
