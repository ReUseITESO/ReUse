from rest_framework import status
from rest_framework.test import APITestCase

from core.models import User
from marketplace.models import Category, Products


class ProductDeleteTests(APITestCase):
    PRODUCTS_URL = "/api/marketplace/products/"

    def setUp(self):
        self.seller = User.objects.create(
            username="seller_delete",
            email="seller@iteso.mx",
            name="Ana García",
            phone="3312345678",
        )
        self.other_user = User.objects.create(
            username="other_delete",
            email="other@iteso.mx",
            name="Carlos López",
            phone="3312345679",
        )
        self.category = Category.objects.create(name="Libros")
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
        self.client.credentials(HTTP_X_MOCK_USER_ID=str(user.pk))

    def _url(self, product_id=None):
        product_id = product_id or self.product.pk
        return f"{self.PRODUCTS_URL}{product_id}/"

    def test_delete_own_disponible_product_returns_204(self):
        self._auth()
        response = self.client.delete(self._url())
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_deleted_product_not_in_list(self):
        self._auth()
        self.client.delete(self._url())
        response = self.client.get(self.PRODUCTS_URL)
        titles = [p["title"] for p in response.data["results"]]
        self.assertNotIn("Libro de Cálculo", titles)

    def test_deleted_product_removed_from_database(self):
        self._auth()
        self.client.delete(self._url())
        self.assertFalse(Products.objects.filter(pk=self.product.pk).exists())

    def test_delete_without_auth_returns_401(self):
        response = self.client.delete(self._url())
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_delete_other_user_product_returns_403(self):
        self._auth(self.other_user)
        response = self.client.delete(self._url())
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_product_not_disponible_returns_400(self):
        self.product.status = "en_proceso"
        self.product.save(update_fields=["status"])
        self._auth()
        response = self.client.delete(self._url())
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_delete_completed_product_returns_400(self):
        self.product.status = "completado"
        self.product.save(update_fields=["status"])
        self._auth()
        response = self.client.delete(self._url())
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_delete_nonexistent_product_returns_404(self):
        self._auth()
        response = self.client.delete(f"{self.PRODUCTS_URL}99999/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
