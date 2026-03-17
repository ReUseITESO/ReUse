from rest_framework import status
from rest_framework.test import APITestCase

from core.models import User
from marketplace.models import Category, Products


class ProductUpdateTests(APITestCase):
    PRODUCTS_URL = "/api/marketplace/products/"

    def setUp(self):
        self.seller = User.objects.create(
            email="seller@iteso.mx",
            first_name="Ana",
            last_name="García",
            phone="3312345678",
        )
        self.other_user = User.objects.create(
            email="other@iteso.mx",
            first_name="Carlos",
            last_name="López",
            phone="3312345679",
        )
        self.category = Category.objects.create(name="Libros")
        self.other_category = Category.objects.create(name="Electrónica")
        self.product = Products.objects.create(
            seller=self.seller,
            category=self.category,
            title="Libro de Cálculo",
            description="Buen estado, sin notas.",
            condition="buen_estado",
            transaction_type="sale",
            price="150.00",
        )

    def _auth(self, user=None):
        user = user or self.seller
        self.client.force_authenticate(user=user)

    def _url(self, product_id=None):
        product_id = product_id or self.product.pk
        return f"{self.PRODUCTS_URL}{product_id}/"

    def test_update_own_product_returns_200(self):
        self._auth()
        response = self.client.patch(
            self._url(),
            {"title": "Libro de Álgebra", "price": "200.00"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "Libro de Álgebra")
        self.assertEqual(response.data["price"], "200.00")

    def test_partial_update_single_field_returns_200(self):
        self._auth()
        response = self.client.patch(
            self._url(),
            {"title": "Solo el título"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "Solo el título")
        self.assertEqual(response.data["price"], "150.00")

    def test_update_category_returns_200(self):
        self._auth()
        response = self.client.patch(
            self._url(),
            {"category": self.other_category.pk},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["category"]["name"], "Electrónica")

    def test_update_transaction_type_to_donation_clears_price(self):
        self._auth()
        response = self.client.patch(
            self._url(),
            {"transaction_type": "donation", "price": None},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["transaction_type"], "donation")
        self.assertIsNone(response.data["price"])

    def test_update_without_auth_returns_401(self):
        response = self.client.patch(
            self._url(),
            {"title": "No auth"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_update_other_user_product_returns_403(self):
        self._auth(self.other_user)
        response = self.client.patch(
            self._url(),
            {"title": "Hacked"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_update_product_not_disponible_returns_400(self):
        self.product.status = "en_proceso"
        self.product.save(update_fields=["status"])
        self._auth()
        response = self.client.patch(
            self._url(),
            {"title": "Cambiar en proceso"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_update_donation_with_price_returns_400(self):
        self._auth()
        response = self.client.patch(
            self._url(),
            {"transaction_type": "donation", "price": "50.00"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_update_sale_without_price_returns_400(self):
        self._auth()
        response = self.client.patch(
            self._url(),
            {"transaction_type": "sale", "price": None},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_put_method_returns_405(self):
        self._auth()
        response = self.client.put(
            self._url(),
            {
                "title": "Full update",
                "description": "Desc",
                "condition": "buen_estado",
                "transaction_type": "sale",
                "price": "100.00",
                "category": self.category.pk,
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_update_nonexistent_product_returns_404(self):
        self._auth()
        response = self.client.patch(
            f"{self.PRODUCTS_URL}99999/",
            {"title": "Ghost"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
