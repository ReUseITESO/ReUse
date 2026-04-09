from rest_framework.test import APITestCase

from core.models import User
from marketplace.models import Category, Products


class TransactionSwapApiBaseTestCase(APITestCase):
    TRANSACTIONS_URL = "/api/marketplace/transactions/"

    def setUp(self):
        self.seller = User.objects.create(
            email="seller_swap@iteso.mx",
            first_name="Sara",
            last_name="Seller",
            phone="3310000001",
        )
        self.buyer = User.objects.create(
            email="buyer_swap@iteso.mx",
            first_name="Bruno",
            last_name="Buyer",
            phone="3310000002",
        )
        self.other_user = User.objects.create(
            email="other_swap@iteso.mx",
            first_name="Olga",
            last_name="Other",
            phone="3310000003",
        )
        self.category = Category.objects.create(name="Intercambio")
        self.swap_target_product = Products.objects.create(
            seller=self.seller,
            category=self.category,
            title="Libro de Redes",
            description="Solo intercambio",
            condition="buen_estado",
            transaction_type="swap",
            status="disponible",
            price=None,
        )
        self.buyer_swap_product = Products.objects.create(
            seller=self.buyer,
            category=self.category,
            title="Libro de Cálculo",
            description="Disponible para proponer",
            condition="usado",
            transaction_type="sale",
            status="disponible",
            price="120.00",
        )
        self.alt_buyer_swap_product = Products.objects.create(
            seller=self.buyer,
            category=self.category,
            title="Calculadora Casio",
            description="Segunda opción",
            condition="como_nuevo",
            transaction_type="sale",
            status="disponible",
            price="350.00",
        )

    def _auth(self, user):
        self.client.force_authenticate(user=user)

    def _status_url(self, transaction_id):
        return f"{self.TRANSACTIONS_URL}{transaction_id}/status/"

    def _swap_proposal_url(self, transaction_id):
        return f"{self.TRANSACTIONS_URL}{transaction_id}/swap-proposal/"

    def _swap_no_accept_url(self, transaction_id):
        return f"{self.TRANSACTIONS_URL}{transaction_id}/swap-no-accept/"

    def _swap_meeting_url(self, transaction_id):
        return f"{self.TRANSACTIONS_URL}{transaction_id}/swap-meeting/"

    def _swap_meeting_response_url(self, transaction_id):
        return f"{self.TRANSACTIONS_URL}{transaction_id}/swap-meeting-response/"

    def _create_swap_transaction(self):
        self._auth(self.buyer)
        return self.client.post(
            self.TRANSACTIONS_URL,
            {
                "product_id": self.swap_target_product.pk,
                "swap_product_id": self.buyer_swap_product.pk,
            },
            format="json",
        )
