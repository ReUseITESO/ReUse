from django.test import TestCase

from core.models import User
from core.models.notification import Notification
from gamification.models.badges import Badges
from gamification.models.user_badges import UserBadges
from marketplace.models.category import Category
from marketplace.models.product import Products
from marketplace.models.transaction import Transaction


class BadgeServiceTest(TestCase):
    def setUp(self):
        self.user = User.objects.create(
            email="test.milestone@iteso.mx",
            first_name="Test",
            last_name="Milestone",
            points=0,
        )

        self.user2 = User.objects.create(
            email="test.milestone2@iteso.mx",
            first_name="Test",
            last_name="Milestone2",
            points=0,
        )

        self.category = Category.objects.create(name="Libros")

        Badges.objects.create(name="Publicador Novato", description="test", points=10)
        Badges.objects.create(name="Eco Warrior", description="test", points=50)
        Badges.objects.create(name="Vendedor Top", description="test", points=100)
        Badges.objects.create(name="Trueque Master", description="test", points=20)
        Badges.objects.create(name="Perfil Completo", description="test", points=0)

    def test_evaluate_publicador_novato(self):
        Products.objects.create(
            seller=self.user,
            category=self.category,
            title="Producto de prueba",
            description="desc",
            condition="nuevo",
            transaction_type="sale",
            price=10.0,
            status="disponible",
        )

        badge_names = list(
            UserBadges.objects.filter(user=self.user).values_list(
                "badges__name", flat=True
            )
        )

        self.assertIn("Publicador Novato", badge_names)

        self.user.refresh_from_db()
        self.assertEqual(self.user.points, 10)
        self.assertTrue(
            Notification.objects.filter(user=self.user, type="badge_earned").exists()
        )

    def test_evaluate_perfil_completo(self):
        self.user.phone = "1234567890"
        self.user.profile_picture = "http://example.com/pic.png"
        self.user.save()

        badge_names = list(
            UserBadges.objects.filter(user=self.user).values_list(
                "badges__name", flat=True
            )
        )
        self.assertIn("Perfil Completo", badge_names)

    def test_evaluate_trueque_master(self):
        for i in range(3):
            product = Products.objects.create(
                seller=self.user,
                category=self.category,
                title=f"Producto {i}",
                description="desc",
                condition="usado",
                transaction_type="swap",
                status="completado",
            )
            Transaction.objects.create(
                product=product,
                seller=self.user,
                buyer=self.user2,
                transaction_type="swap",
                status="completada",
            )

        badge_names = list(
            UserBadges.objects.filter(user=self.user).values_list(
                "badges__name", flat=True
            )
        )

        self.assertIn("Publicador Novato", badge_names)
        self.assertIn("Trueque Master", badge_names)

    def test_evaluate_eco_warrior(self):
        for i in range(3):
            product = Products.objects.create(
                seller=self.user,
                category=self.category,
                title=f"Prod {i}",
                description="desc",
                condition="nuevo",
                transaction_type="donation",
                status="completado",
            )
            Transaction.objects.create(
                product=product,
                seller=self.user,
                buyer=self.user2,
                transaction_type="donation",
                status="completada",
            )

        badge_names = list(
            UserBadges.objects.filter(user=self.user).values_list(
                "badges__name", flat=True
            )
        )
        self.assertIn("Eco Warrior", badge_names)
