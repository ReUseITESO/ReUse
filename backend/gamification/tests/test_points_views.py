from rest_framework import status
from rest_framework.test import APITestCase

from core.models import User


class CurrentUserPointsViewTests(APITestCase):
    """Tests for GET /api/gamification/points/ endpoint"""
    
    POINTS_URL = "/api/gamification/points/"

    def setUp(self):
        """Create test users with different point balances"""
        self.user_ana = User.objects.create(
            email="ana.garcia@iteso.mx",
            first_name="Ana",
            last_name="García",
            phone="3312345678",
            points=150,
        )
        self.user_carlos = User.objects.create(
            email="carlos.lopez@iteso.mx",
            first_name="Carlos",
            last_name="López",
            phone="3387654321",
            points=80,
        )
        self.user_zero_points = User.objects.create(
            email="maria.torres@iteso.mx",
            first_name="María",
            last_name="Torres",
            phone="3356781234",
            points=0,
        )

    def _auth(self, user):
        """Authenticate requests as a specific user"""
        self.client.force_authenticate(user=user)

    # --- Authentication tests ---

    def test_get_points_without_auth_returns_401(self):
        """Unauthenticated request should return 401"""
        response = self.client.get(self.POINTS_URL)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("error", response.data)
        self.assertIn("details", response.data["error"])
        self.assertIn("detail", response.data["error"]["details"])

    def test_get_points_with_invalid_user_id_returns_401(self):
        """Request with mock header but no auth should still return 401"""
        self.client.credentials(HTTP_X_MOCK_USER_ID="99999")
        response = self.client.get(self.POINTS_URL)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # --- Happy path tests ---

    def test_get_points_returns_200_with_correct_points(self):
        """Authenticated user should get their points balance"""
        self._auth(self.user_ana)
        response = self.client.get(self.POINTS_URL)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("points", response.data)
        self.assertEqual(response.data["points"], 150)

    def test_get_points_returns_different_points_for_different_users(self):
        """Different users should see their own points"""
        # First user
        self._auth(self.user_ana)
        response1 = self.client.get(self.POINTS_URL)
        self.assertEqual(response1.data["points"], 150)
        
        # Second user
        self._auth(self.user_carlos)
        response2 = self.client.get(self.POINTS_URL)
        self.assertEqual(response2.data["points"], 80)

    def test_get_points_with_zero_points_returns_0(self):
        """User with 0 points should get valid response"""
        self._auth(self.user_zero_points)
        response = self.client.get(self.POINTS_URL)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["points"], 0)

    # --- Data format tests ---

    def test_response_format_is_correct(self):
        """Response should have correct JSON structure"""
        self._auth(self.user_ana)
        response = self.client.get(self.POINTS_URL)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, dict)
        self.assertIn("points", response.data)
        self.assertIsInstance(response.data["points"], int)

    def test_points_field_is_numeric(self):
        """Points field should be a number, not string"""
        self._auth(self.user_ana)
        response = self.client.get(self.POINTS_URL)
        
        points = response.data["points"]
        self.assertIsInstance(points, int)
        self.assertGreaterEqual(points, 0)


class UserPointsViewTests(APITestCase):
    """Tests for GET /api/gamification/points/<user_id>/ endpoint"""
    
    POINTS_BASE_URL = "/api/gamification/points/"

    def setUp(self):
        """Create test user"""
        self.user = User.objects.create(
            email="ana.garcia@iteso.mx",
            first_name="Ana",
            last_name="García",
            phone="3312345678",
            points=200,
        )

    def test_get_specific_user_points_returns_200(self):
        """Can retrieve points for specific user by ID"""
        url = f"{self.POINTS_BASE_URL}{self.user.pk}/"
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["points"], 200)

    def test_get_nonexistent_user_points_returns_404(self):
        """Request for non-existent user should return 404"""
        url = f"{self.POINTS_BASE_URL}99999/"
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("detail", response.data)
        self.assertIn("not found", response.data["detail"].lower())
