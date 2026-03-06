from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

from gamification.services.level_progression import build_level_progression

User = get_user_model()


class LevelProgressionServiceTests(APITestCase):
    def test_build_level_progression_negative_points_are_clamped_to_zero(self):
        result = build_level_progression(points=-25)

        self.assertEqual(result["points"], 0)
        self.assertEqual(result["current_level"]["name"], "Beginner Reuser")
        self.assertEqual(result["progress_percent"], 0)

    def test_build_level_progression_beginner_level(self):
        result = build_level_progression(points=40)

        self.assertEqual(result["current_level"]["name"], "Beginner Reuser")
        self.assertEqual(result["next_level"]["name"], "Active Reuser")
        self.assertEqual(result["progress_percent"], 40)
        self.assertEqual(result["points_to_next_level"], 60)
        self.assertFalse(result["is_max_level"])

    def test_build_level_progression_exact_threshold(self):
        result = build_level_progression(points=250)

        self.assertEqual(result["current_level"]["name"], "Eco Champion")
        self.assertEqual(result["next_level"]["name"], "Sustainability Leader")
        self.assertEqual(result["progress_percent"], 0)
        self.assertEqual(result["points_to_next_level"], 250)

    def test_build_level_progression_second_level_exact_threshold(self):
        result = build_level_progression(points=100)

        self.assertEqual(result["current_level"]["name"], "Active Reuser")
        self.assertEqual(result["next_level"]["name"], "Eco Champion")
        self.assertEqual(result["progress_percent"], 0)
        self.assertEqual(result["points_to_next_level"], 150)

    def test_build_level_progression_max_level(self):
        result = build_level_progression(points=800)

        self.assertEqual(result["current_level"]["name"], "Sustainability Leader")
        self.assertIsNone(result["next_level"])
        self.assertEqual(result["progress_percent"], 100)
        self.assertEqual(result["points_to_next_level"], 0)
        self.assertTrue(result["is_max_level"])


class CurrentUserLevelProgressionViewTests(APITestCase):
    URL = "/api/gamification/level-progression/"

    def setUp(self):
        self.user = User.objects.create(
            email="ana.garcia@iteso.mx",
            first_name="Ana",
            last_name="Garcia",
            phone="3312345678",
            points=180,
        )

    def test_get_level_progression_requires_auth(self):
        response = self.client.get(self.URL)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data["detail"], "Authentication required.")

    def test_post_is_not_allowed(self):
        response = self.client.post(self.URL, {}, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_level_progression_returns_expected_payload(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.URL)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["points"], 180)
        self.assertEqual(response.data["current_level"]["name"], "Active Reuser")
        self.assertEqual(response.data["next_level"]["name"], "Eco Champion")
        self.assertEqual(response.data["progress_percent"], 53)
        self.assertEqual(response.data["points_to_next_level"], 70)

    def test_get_level_progression_returns_max_level_state(self):
        self.user.points = 700
        self.user.save(update_fields=["points"])

        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.URL)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["current_level"]["name"], "Sustainability Leader")
        self.assertIsNone(response.data["next_level"])
        self.assertEqual(response.data["progress_percent"], 100)
        self.assertEqual(response.data["points_to_next_level"], 0)
        self.assertTrue(response.data["is_max_level"])
