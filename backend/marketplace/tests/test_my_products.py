from rest_framework import status
from rest_framework.test import APITestCase

from core.models import User
from marketplace.models import Category, Products


class MyProductsTests(APITestCase):
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

        self.product_disponible = Products.objects.create(
            seller=self.seller,
            category=self.category,
            title="Disponible",
            description="Producto disponible.",
            condition="nuevo",
            transaction_type="sale",
            price="100.00",
        )
        self.product_en_proceso = Products.objects.create(
            seller=self.seller,
            category=self.category,
            title="En Proceso",
            description="Producto en proceso.",
            condition="usado",
            transaction_type="sale",
            price="80.00",
            status="en_proceso",
        )
        self.product_pausado = Products.objects.create(
            seller=self.seller,
            category=self.category,
            title="Pausado",
            description="Producto pausado.",
            condition="usado",
            transaction_type="sale",
            price="70.00",
            status="pausado",
        )
        self.product_completado = Products.objects.create(
            seller=self.seller,
            category=self.category,
            title="Completado",
            description="Producto completado.",
            condition="buen_estado",
            transaction_type="donation",
            status="completado",
        )
        self.product_cancelado = Products.objects.create(
            seller=self.seller,
            category=self.category,
            title="Cancelado",
            description="Producto cancelado.",
            condition="como_nuevo",
            transaction_type="swap",
            status="cancelado",
        )
        self.other_product = Products.objects.create(
            seller=self.other_user,
            category=self.category,
            title="Producto de Otro",
            description="No debe aparecer.",
            condition="nuevo",
            transaction_type="sale",
            price="200.00",
        )

    def _auth(self, user=None):
        user = user or self.seller
        self.client.force_authenticate(user=user)

    def test_list_my_products_returns_all_statuses(self):
        self._auth()
        response = self.client.get(self.PRODUCTS_URL, {"seller": "me"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        titles = [p["title"] for p in response.data["results"]]
        self.assertIn("Disponible", titles)
        self.assertIn("En Proceso", titles)
        self.assertIn("Pausado", titles)
        self.assertIn("Completado", titles)
        self.assertIn("Cancelado", titles)

    def test_list_my_products_does_not_include_other_users_products(self):
        self._auth()
        response = self.client.get(self.PRODUCTS_URL, {"seller": "me"})
        titles = [p["title"] for p in response.data["results"]]
        self.assertNotIn("Producto de Otro", titles)

    def test_list_my_products_count(self):
        self._auth()
        response = self.client.get(self.PRODUCTS_URL, {"seller": "me"})
        self.assertEqual(response.data["count"], 5)

    def test_list_my_products_is_paginated(self):
        self._auth()
        response = self.client.get(self.PRODUCTS_URL, {"seller": "me"})
        self.assertIn("count", response.data)
        self.assertIn("results", response.data)

    def test_list_my_products_without_auth_returns_empty(self):
        response = self.client.get(self.PRODUCTS_URL, {"seller": "me"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 0)

    def test_list_products_without_seller_param_only_disponible(self):
        response = self.client.get(self.PRODUCTS_URL)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        statuses = [p["status"] for p in response.data["results"]]
        for product_status in statuses:
            self.assertEqual(product_status, "disponible")

    def test_list_products_includes_seller_id_field(self):
        response = self.client.get(self.PRODUCTS_URL)
        results = response.data["results"]
        if results:
            self.assertIn("seller_id", results[0])

    def test_list_products_includes_updated_at_field(self):
        response = self.client.get(self.PRODUCTS_URL)
        results = response.data["results"]
        if results:
            self.assertIn("updated_at", results[0])

    def test_list_my_products_switching_user_returns_own_only(self):
        self._auth(self.seller)
        response_seller = self.client.get(self.PRODUCTS_URL, {"seller": "me"})
        self._auth(self.other_user)
        response_other = self.client.get(self.PRODUCTS_URL, {"seller": "me"})
        self.assertEqual(response_seller.data["count"], 5)
        self.assertEqual(response_other.data["count"], 1)
        other_titles = [p["title"] for p in response_other.data["results"]]
        self.assertEqual(other_titles, ["Producto de Otro"])
