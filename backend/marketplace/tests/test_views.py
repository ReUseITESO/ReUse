from rest_framework import status
from rest_framework.test import APITestCase

from core.models import User
from marketplace.models import Category, Products


class ProductViewSetTests(APITestCase):
    PRODUCTS_URL = "/api/marketplace/products/"

    def setUp(self):
        self.seller = User.objects.create(
            email="seller@iteso.mx",
            first_name="Ana",
            last_name="García",
            phone="3312345678",
        )
        self.category = Category.objects.create(name="Libros")

    def _auth(self):
        """Authenticate as the seller for subsequent requests."""
        self.client.force_authenticate(user=self.seller)

    def _payload(self, **overrides):
        base = {
            "title": "Libro de Cálculo",
            "description": "Buen estado, sin notas al margen.",
            "condition": "buen_estado",
            "transaction_type": "sale",
            "price": "150.00",
            "category": self.category.pk,
        }
        base.update(overrides)
        return base

    # --- Create: authentication ---

    def test_create_without_auth_returns_401(self):
        response = self.client.post(self.PRODUCTS_URL, self._payload(), format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_with_invalid_user_id_returns_401(self):
        # Without authentication, should return 401
        response = self.client.post(self.PRODUCTS_URL, self._payload(), format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # --- Create: happy path ---

    def test_create_sale_returns_201(self):
        self._auth()
        response = self.client.post(self.PRODUCTS_URL, self._payload(), format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_create_returns_product_id(self):
        self._auth()
        response = self.client.post(self.PRODUCTS_URL, self._payload(), format="json")
        self.assertIn("id", response.data)

    def test_create_links_seller(self):
        self._auth()
        self.client.post(self.PRODUCTS_URL, self._payload(), format="json")
        product = Products.objects.get(title="Libro de Cálculo")
        self.assertEqual(product.seller, self.seller)

    def test_create_donation_without_price(self):
        self._auth()
        payload = self._payload(transaction_type="donation", price=None)
        response = self.client.post(self.PRODUCTS_URL, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_create_swap_without_price(self):
        self._auth()
        payload = self._payload(transaction_type="swap", price=None)
        response = self.client.post(self.PRODUCTS_URL, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    # --- Create: validation errors ---

    def test_create_donation_with_price_returns_400(self):
        self._auth()
        payload = self._payload(transaction_type="donation", price="50.00")
        response = self.client.post(self.PRODUCTS_URL, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_sale_without_price_returns_400(self):
        self._auth()
        payload = self._payload(transaction_type="sale", price=None)
        response = self.client.post(self.PRODUCTS_URL, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_missing_title_returns_400(self):
        self._auth()
        payload = self._payload()
        del payload["title"]
        response = self.client.post(self.PRODUCTS_URL, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_missing_description_returns_400(self):
        self._auth()
        payload = self._payload()
        del payload["description"]
        response = self.client.post(self.PRODUCTS_URL, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # --- List: only available products ---

    def test_list_returns_only_available_products(self):
        self._auth()
        self.client.post(self.PRODUCTS_URL, self._payload(title="Disponible"), format="json")
        Products.objects.filter(title="Disponible").update(status="en_proceso")
        self.client.post(self.PRODUCTS_URL, self._payload(title="Visible"), format="json")

        self.client.force_authenticate(user=None)  # remove auth for listing
        response = self.client.get(self.PRODUCTS_URL)
        titles = [p["title"] for p in response.data["results"]]
        self.assertNotIn("Disponible", titles)
        self.assertIn("Visible", titles)

    def test_list_returns_200(self):
        response = self.client.get(self.PRODUCTS_URL)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_list_response_is_paginated(self):
        response = self.client.get(self.PRODUCTS_URL)
        self.assertIn("count", response.data)
        self.assertIn("results", response.data)
