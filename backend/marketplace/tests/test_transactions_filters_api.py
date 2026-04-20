from rest_framework import status
from rest_framework.test import APITestCase

from core.models import User
from marketplace.models import Category, Products, Transaction


class TransactionFiltersApiTests(APITestCase):
    URL = "/api/marketplace/transactions/"

    def setUp(self):
        self.seller = User.objects.create(
            email="seller_filters@iteso.mx", phone="3310000001"
        )
        self.buyer = User.objects.create(
            email="buyer_filters@iteso.mx", phone="3310000002"
        )
        category = Category.objects.create(name="Libros")

        pending_product = Products.objects.create(
            seller=self.seller,
            category=category,
            title="Pendiente",
            description="Pendiente",
            condition="usado",
            transaction_type="sale",
            status="en_proceso",
            price="90.00",
        )
        confirmed_product = Products.objects.create(
            seller=self.seller,
            category=category,
            title="Confirmada",
            description="Confirmada",
            condition="buen_estado",
            transaction_type="sale",
            status="en_proceso",
            price="120.00",
        )
        completed_product = Products.objects.create(
            seller=self.seller,
            category=category,
            title="Completada",
            description="Completada",
            condition="como_nuevo",
            transaction_type="sale",
            status="completado",
            price="110.00",
        )

        Transaction.objects.create(
            product=pending_product,
            seller=self.seller,
            buyer=self.buyer,
            transaction_type="sale",
            delivery_location="Edificio A · Salon 101",
            status="pendiente",
        )
        Transaction.objects.create(
            product=confirmed_product,
            seller=self.seller,
            buyer=self.buyer,
            transaction_type="sale",
            delivery_location="Edificio A · Salon 102",
            status="confirmada",
        )
        Transaction.objects.create(
            product=completed_product,
            seller=self.seller,
            buyer=self.buyer,
            transaction_type="sale",
            delivery_location="Edificio A · Salon 103",
            status="completada",
        )

    def test_status_filter_supports_multiple_values(self):
        self.client.force_authenticate(user=self.seller)

        response = self.client.get(
            self.URL,
            {"role": "seller", "status": ["pendiente", "confirmada"]},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 2)
        returned_statuses = {result["status"] for result in response.data["results"]}
        self.assertEqual(returned_statuses, {"pendiente", "confirmada"})
