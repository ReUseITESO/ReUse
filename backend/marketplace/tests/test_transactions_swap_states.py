from datetime import timedelta

from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from core.models import User
from marketplace.models import Category, Products, Transaction


class SwapTransactionStateTests(APITestCase):
    URL = "/api/marketplace/transactions/"

    def setUp(self):
        self.seller = User.objects.create(
            email="seller_states@iteso.mx", phone="3311000001"
        )
        self.buyer = User.objects.create(
            email="buyer_states@iteso.mx", phone="3311000002"
        )
        category = Category.objects.create(name="Electronica")

        self.target = Products.objects.create(
            seller=self.seller,
            category=category,
            title="Teclado",
            description="Objetivo",
            condition="buen_estado",
            transaction_type="swap",
            status="disponible",
        )
        self.proposed = Products.objects.create(
            seller=self.buyer,
            category=category,
            title="Mouse",
            description="Propuesto",
            condition="usado",
            transaction_type="sale",
            status="disponible",
            price="100.00",
        )

    def _create_swap(self):
        self.client.force_authenticate(user=self.buyer)
        return self.client.post(
            self.URL,
            {"product_id": self.target.id, "proposed_product_id": self.proposed.id},
            format="json",
        )

    def test_proposed_product_returns_available_on_cancel(self):
        create_response = self._create_swap()
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)

        self.proposed.refresh_from_db()
        self.assertEqual(self.proposed.status, "en_proceso")

        transaction_id = create_response.data["id"]
        self.client.patch(
            f"{self.URL}{transaction_id}/status/",
            {"status": "cancelada"},
            format="json",
        )

        self.proposed.refresh_from_db()
        self.assertEqual(self.proposed.status, "disponible")

    def test_proposed_product_returns_available_on_expiration(self):
        create_response = self._create_swap()
        transaction_id = create_response.data["id"]

        Transaction.objects.filter(pk=transaction_id).update(
            created_at=timezone.now() - timedelta(hours=25)
        )

        self.client.force_authenticate(user=self.seller)
        response = self.client.patch(
            f"{self.URL}{transaction_id}/status/",
            {"status": "confirmada"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)

        self.proposed.refresh_from_db()
        self.assertEqual(self.proposed.status, "disponible")
