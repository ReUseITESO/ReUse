from django.test import TestCase

from core.models import User
from marketplace.models import Category
from marketplace.serializers import ProductCreateSerializer


class ProductCreateSerializerTests(TestCase):
    def setUp(self):
        self.seller = User.objects.create(
            email="seller@iteso.mx",
            name="Seller",
            phone="3300000001",
        )
        self.category = Category.objects.create(name="Libros")

    def _make_data(self, **overrides):
        base = {
            "title": "Libro de Cálculo",
            "description": "Muy buen estado, sin notas.",
            "condition": "buen_estado",
            "transaction_type": "sale",
            "price": "150.00",
            "category": self.category.pk,
        }
        base.update(overrides)
        return base

    # --- Happy paths ---

    def test_valid_sale_is_valid(self):
        serializer = ProductCreateSerializer(data=self._make_data())
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_valid_donation_without_price_is_valid(self):
        data = self._make_data(transaction_type="donation", price=None)
        serializer = ProductCreateSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_valid_swap_without_price_is_valid(self):
        data = self._make_data(transaction_type="swap", price=None)
        serializer = ProductCreateSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    # --- Business rule violations ---

    def test_donation_with_price_is_invalid(self):
        data = self._make_data(transaction_type="donation", price="50.00")
        serializer = ProductCreateSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("price", serializer.errors)

    def test_sale_without_price_is_invalid(self):
        data = self._make_data(transaction_type="sale", price=None)
        serializer = ProductCreateSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("price", serializer.errors)

    def test_sale_with_zero_price_is_invalid(self):
        data = self._make_data(transaction_type="sale", price="0.00")
        serializer = ProductCreateSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("price", serializer.errors)

    # --- Required fields ---

    def test_missing_title_is_invalid(self):
        data = self._make_data()
        del data["title"]
        serializer = ProductCreateSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("title", serializer.errors)

    def test_missing_category_is_invalid(self):
        data = self._make_data()
        del data["category"]
        serializer = ProductCreateSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("category", serializer.errors)

    def test_invalid_condition_choice_is_invalid(self):
        data = self._make_data(condition="perfecto")
        serializer = ProductCreateSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("condition", serializer.errors)
