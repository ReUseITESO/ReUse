from rest_framework.test import APITestCase
from django.utils import timezone
from django.urls import reverse
from core.models import User
from gamification.models.badges import Badges
from gamification.models.user_badges import UserBadges

class TestUserBadgesStatusView(APITestCase):
    def setUp(self):
        # Crear usuario de prueba
        self.user = User.objects.create_user(
            email='test@iteso.mx',
            first_name='Test',
            last_name='User',
            password='testpass123'
        )
        
        # Crear medallas
        self.badge_earned = Badges.objects.create(
            name="Primera Venta",
            description="Completaste tu primera venta",
            points=50,
            rarity="comun"
        )
        self.badge_locked = Badges.objects.create(
            name="Eco Warrior",
            description="Donaste 5 artículos",
            points=100,
            rarity="raro"
        )
        
        # Asignar una medalla
        UserBadges.objects.create(
            user=self.user,
            badges=self.badge_earned,
            earned_at=timezone.now()
        )
        
        self.url = reverse('user-badges-status')

    def test_get_badges_unauthenticated_returns_401(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 401)

    def test_get_badges_authenticated_returns_200(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, 200)

    def test_get_badges_returns_correct_earned_and_locked_status(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.url)
        self.assertEqual(len(response.data), 2)
        
        earned_badge = next(b for b in response.data if b['id'] == self.badge_earned.id)
        locked_badge = next(b for b in response.data if b['id'] == self.badge_locked.id)
        
        self.assertIsNotNone(earned_badge['earned_at'])
        self.assertIsNone(locked_badge['earned_at'])