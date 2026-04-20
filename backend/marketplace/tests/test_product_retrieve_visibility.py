from rest_framework import status
from rest_framework.test import APITestCase

from core.models import User
from marketplace.models import Category, Products, Transaction
from marketplace.services.transaction_swap_meta import (
    SWAP_STAGE_PROPOSAL_PENDING,
    build_swap_meta,
)


class ProductRetrieveVisibilityTests(APITestCase):
    PRODUCTS_URL = "/api/marketplace/products/"

    def setUp(self):
        self.seller = User.objects.create(
            email="seller@iteso.mx",
            first_name="Ana",
            last_name="Garcia",
            phone="3312345600",
        )
        self.buyer = User.objects.create(
            email="buyer@iteso.mx",
            first_name="Luis",
            last_name="Mendez",
            phone="3312345601",
        )
        self.outsider = User.objects.create(
            email="outsider@iteso.mx",
            first_name="Sofia",
            last_name="Ruiz",
            phone="3312345602",
        )
        self.category = Category.objects.create(name="Electronica")

        self.requested_product = Products.objects.create(
            seller=self.seller,
            category=self.category,
            title="Consola retro",
            description="Consola en buen estado.",
            condition="buen_estado",
            transaction_type="swap",
            status="en_proceso",
            price=None,
        )
        self.proposed_product = Products.objects.create(
            seller=self.buyer,
            category=self.category,
            title="Teclado mecanico",
            description="Switches azules.",
            condition="usado",
            transaction_type="swap",
            status="en_proceso",
            price=None,
        )

        swap_meta = build_swap_meta(
            proposed_product_id=self.proposed_product.id,
            stage=SWAP_STAGE_PROPOSAL_PENDING,
        )
        Transaction.objects.create(
            product=self.requested_product,
            seller=self.seller,
            buyer=self.buyer,
            transaction_type="swap",
            delivery_location=swap_meta,
            status="pendiente",
        )

    def _detail_url(self, product_id):
        return f"{self.PRODUCTS_URL}{product_id}/"

    def test_buyer_can_retrieve_requested_product_in_process(self):
        self.client.force_authenticate(user=self.buyer)

        response = self.client.get(self._detail_url(self.requested_product.id))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], self.requested_product.id)

    def test_seller_can_retrieve_proposed_product_in_process(self):
        self.client.force_authenticate(user=self.seller)

        response = self.client.get(self._detail_url(self.proposed_product.id))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["id"], self.proposed_product.id)

    def test_outsider_cannot_retrieve_requested_product_in_process(self):
        self.client.force_authenticate(user=self.outsider)

        response = self.client.get(self._detail_url(self.requested_product.id))

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_outsider_cannot_retrieve_proposed_product_in_process(self):
        self.client.force_authenticate(user=self.outsider)

        response = self.client.get(self._detail_url(self.proposed_product.id))

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_outsider_list_does_not_include_in_process_swap_products(self):
        self.client.force_authenticate(user=self.outsider)

        response = self.client.get(self.PRODUCTS_URL)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ids = [item["id"] for item in response.data["results"]]
        self.assertNotIn(self.requested_product.id, ids)
        self.assertNotIn(self.proposed_product.id, ids)
