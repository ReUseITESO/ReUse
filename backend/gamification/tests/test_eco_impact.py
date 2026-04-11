from django.contrib.auth import get_user_model
from django.test import TestCase

from gamification.models.environment_impact import EnvironmentImpact
from gamification.models.point_rule import PointAction, PointRule
from gamification.services.impact_service import get_user_impact
from gamification.services.point_service import award_points

User = get_user_model()


class EcoImpactTests(TestCase):
    def setUp(self):
        # Create test users
        self.user1 = User.objects.create_user(
            email="user1@iteso.mx",
            password="testpassword",
            first_name="User",
            last_name="One",
        )
        self.user2 = User.objects.create_user(
            email="user2@iteso.mx",
            password="testpassword",
            first_name="User",
            last_name="Two",
        )

        # Create PointRules required for testing
        PointRule.objects.create(
            action=PointAction.PUBLISH_ITEM, points=10, is_active=True
        )
        PointRule.objects.create(
            action=PointAction.COMPLETE_SALE, points=15, is_active=True
        )
        PointRule.objects.create(
            action=PointAction.COMPLETE_DONATION, points=25, is_active=True
        )

    def test_non_impact_action(self):
        """Standard actions like publishing an item should NOT affect eco impact."""
        award_points(self.user1, PointAction.PUBLISH_ITEM)

        # The EnvironmentImpact should NOT have been created
        exists = EnvironmentImpact.objects.filter(user=self.user1).exists()
        self.assertFalse(exists)

    def test_eco_impact_action_creation(self):
        """Eco impact actions should automatically create and update the EnvironmentImpact metrics."""
        award_points(self.user1, PointAction.COMPLETE_DONATION)

        impact = EnvironmentImpact.objects.get(user=self.user1)
        self.assertEqual(impact.reused_products, 1)
        self.assertAlmostEqual(float(impact.kg_co2_saved), 2.5)

    def test_eco_impact_accumulation(self):
        """Multiple eco impact actions should accumulate correctly."""
        award_points(self.user1, PointAction.COMPLETE_SALE)
        award_points(self.user1, PointAction.COMPLETE_DONATION)

        impact = EnvironmentImpact.objects.get(user=self.user1)
        self.assertEqual(impact.reused_products, 2)
        # 2 actions * 2.5 co2 = 5.0
        self.assertAlmostEqual(float(impact.kg_co2_saved), 5.0)

    def test_get_user_impact_service(self):
        """Test the impact service correctly returns data and community averages."""
        # User 1 makes 2 eco impact actions -> 2 products, 5.0 CO2
        award_points(self.user1, PointAction.COMPLETE_SALE)
        award_points(self.user1, PointAction.COMPLETE_SALE)

        # User 2 makes 4 eco impact actions -> 4 products, 10.0 CO2
        award_points(self.user2, PointAction.COMPLETE_DONATION)
        award_points(self.user2, PointAction.COMPLETE_DONATION)
        award_points(self.user2, PointAction.COMPLETE_DONATION)
        award_points(self.user2, PointAction.COMPLETE_DONATION)

        # Service request for User 1
        data = get_user_impact(self.user1)

        # User 1's personal metrics
        self.assertEqual(data["items_reused"], 2)
        self.assertEqual(data["co2_avoided"], 5.0)

        # Community averages (User 1 = 2 products, User 2 = 4 products. Average = 3)
        self.assertEqual(data["community_average_items"], 3.0)

        # CO2 Averages (User 1 = 5.0, User 2 = 10.0. Average = 7.5)
        self.assertEqual(data["community_average_co2"], 7.5)
