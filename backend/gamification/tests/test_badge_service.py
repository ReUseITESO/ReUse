from django.test import TestCase

from core.models import User
from core.models.notification import Notification
from gamification.models.badges import Badges
from gamification.models.user_badges import UserBadges
from gamification.services.badge_service import evaluate_milestones
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

        Badges.objects.create(name="Primer Artículo", description="test", points=10)
        Badges.objects.create(name="Donador Constante", description="test", points=50)
        Badges.objects.create(
            name="Comerciante Frecuente", description="test", points=100
        )
        Badges.objects.create(name="Primer Intercambio", description="test", points=20)
        Badges.objects.create(name="Centurión de Puntos", description="test", points=0)

    def test_evaluate_primer_articulo(self):
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

        unlocked = evaluate_milestones(self.user)

        self.assertEqual(len(unlocked), 1)
        self.assertEqual(unlocked[0].name, "Primer Artículo")

        self.assertTrue(
            UserBadges.objects.filter(
                user=self.user, badges__name="Primer Artículo"
            ).exists()
        )
        self.user.refresh_from_db()
        self.assertEqual(self.user.points, 10)
        self.assertTrue(
            Notification.objects.filter(user=self.user, type="badge_earned").exists()
        )

    def test_evaluate_centurion_de_puntos(self):
        self.user.points = 100
        self.user.save()

        unlocked = evaluate_milestones(self.user)
        badge_names = [b.name for b in unlocked]
        self.assertIn("Centurión de Puntos", badge_names)

    def test_evaluate_primer_intercambio(self):
        product = Products.objects.create(
            seller=self.user,
            category=self.category,
            title="Producto",
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

        unlocked = evaluate_milestones(self.user)
        badge_names = [b.name for b in unlocked]

        self.assertIn("Primer Artículo", badge_names)
        self.assertIn("Primer Intercambio", badge_names)

    def test_donador_constante(self):
        for i in range(5):
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

        unlocked = evaluate_milestones(self.user)
        badge_names = [b.name for b in unlocked]
        self.assertIn("Donador Constante", badge_names)
