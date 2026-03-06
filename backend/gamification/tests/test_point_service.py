from django.test import TestCase

from core.models import User
from gamification.models.point_rule import PointRule, PointAction
from gamification.models.point_transaction import PointTransaction
from gamification.services.point_service import award_points


class AwardPointsServiceTest(TestCase):

    def setUp(self):
        self.user = User.objects.create(
            email="test.user@iteso.mx",
            first_name="Test",
            last_name="User",
            points=0,
        )

        self.rule = PointRule.objects.create(
            action=PointAction.PUBLISH_ITEM,
            points=5,
            is_active=True
        )

    def test_award_points_increases_user_points(self):

        award_points(self.user, PointAction.PUBLISH_ITEM)

        self.user.refresh_from_db()

        self.assertEqual(self.user.points, 5)

    def test_transaction_is_created(self):

        award_points(self.user, PointAction.PUBLISH_ITEM)

        transaction = PointTransaction.objects.first()

        self.assertIsNotNone(transaction)
        self.assertEqual(transaction.points, 5)