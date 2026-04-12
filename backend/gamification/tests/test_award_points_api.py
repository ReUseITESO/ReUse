from rest_framework.test import APITestCase

from core.models import User
from gamification.models.point_rule import PointAction, PointRule


class AwardPointsAPITest(APITestCase):
    def setUp(self):

        self.user = User.objects.create(
            email="test.user@iteso.mx",
            first_name="Test",
            last_name="User",
            points=0,
        )

        self.client.force_authenticate(user=self.user)

        PointRule.objects.create(
            action=PointAction.PUBLISH_ITEM, points=5, is_active=True
        )

    def test_award_points_endpoint(self):

        response = self.client.post(
            "/api/gamification/award-points/",
            {"user_id": self.user.id, "action": "publish_item"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)

        self.user.refresh_from_db()

        self.assertEqual(self.user.points, 5)
