from datetime import timedelta

from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from core.models import User
from marketplace.models import Category, Products, SwapTransaction, Transaction


class SwapTransactionViewTests(APITestCase):
    BASE_URL = "/api/marketplace/transactions/"

    def setUp(self):
        self.seller = User.objects.create(
            email="seller_swapv@iteso.mx",
            first_name="Ana",
            last_name="Vendedora",
            phone="3311111111",
        )
        self.buyer = User.objects.create(
            email="buyer_swapv@iteso.mx",
            first_name="Luis",
            last_name="Comprador",
            phone="3322222222",
        )
        self.category = Category.objects.create(name="Electrónica")

        self.swap_product = Products.objects.create(
            seller=self.seller,
            category=self.category,
            title="Tablet en intercambio",
            description="Tablet para intercambiar",
            condition="buen_estado",
            transaction_type="swap",
            status="disponible",
        )
        self.buyer_product = Products.objects.create(
            seller=self.buyer,
            category=self.category,
            title="Laptop del comprador",
            description="La ofrece el comprador",
            condition="como_nuevo",
            transaction_type="swap",
            status="disponible",
        )
        self.transaction = Transaction.objects.create(
            product=self.swap_product,
            seller=self.seller,
            buyer=self.buyer,
            transaction_type="swap",
            delivery_location="pendiente",
            delivery_date=timezone.now() + timedelta(days=1),
            status="pendiente",
        )

    def _auth(self, user):
        self.client.force_authenticate(user=user)

    def _propose_url(self):
        return f"{self.BASE_URL}{self.transaction.pk}/swap/propose/"

    def _respond_proposal_url(self):
        return f"{self.BASE_URL}{self.transaction.pk}/swap/respond-proposal/"

    def _propose_agenda_url(self):
        return f"{self.BASE_URL}{self.transaction.pk}/swap/propose-agenda/"

    def _respond_agenda_url(self):
        return f"{self.BASE_URL}{self.transaction.pk}/swap/respond-agenda/"

    def _get_swap_url(self):
        return f"{self.BASE_URL}{self.transaction.pk}/swap/"

    def test_propose_without_auth_returns_401(self):
        response = self.client.post(
            self._propose_url(),
            {"proposed_product_id": self.buyer_product.pk},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_buyer_can_propose_swap_returns_201(self):
        self._auth(self.buyer)
        response = self.client.post(
            self._propose_url(),
            {"proposed_product_id": self.buyer_product.pk},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["stage"], "proposal_pending")

    def test_seller_cannot_propose_swap_returns_403(self):
        self._auth(self.seller)
        response = self.client.post(
            self._propose_url(),
            {"proposed_product_id": self.buyer_product.pk},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_duplicate_proposal_returns_409(self):
        SwapTransaction.objects.create(
            transaction=self.transaction,
            proposed_product=self.buyer_product,
            stage=SwapTransaction.Stage.PROPOSAL_PENDING,
        )
        self._auth(self.buyer)
        response = self.client.post(
            self._propose_url(),
            {"proposed_product_id": self.buyer_product.pk},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)

    def test_seller_can_accept_proposal_returns_200(self):
        SwapTransaction.objects.create(
            transaction=self.transaction,
            proposed_product=self.buyer_product,
            stage=SwapTransaction.Stage.PROPOSAL_PENDING,
        )
        self._auth(self.seller)
        response = self.client.patch(
            self._respond_proposal_url(),
            {"accept": True},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["stage"], "proposal_accepted")

    def test_buyer_cannot_respond_to_proposal_returns_403(self):
        SwapTransaction.objects.create(
            transaction=self.transaction,
            proposed_product=self.buyer_product,
            stage=SwapTransaction.Stage.PROPOSAL_PENDING,
        )
        self._auth(self.buyer)
        response = self.client.patch(
            self._respond_proposal_url(),
            {"accept": True},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_buyer_can_propose_agenda_returns_200(self):
        SwapTransaction.objects.create(
            transaction=self.transaction,
            proposed_product=self.buyer_product,
            stage=SwapTransaction.Stage.PROPOSAL_ACCEPTED,
        )
        self._auth(self.buyer)
        future_date = (timezone.now() + timedelta(days=3)).isoformat()
        response = self.client.patch(
            self._propose_agenda_url(),
            {"agenda_location": "Edificio A · Salon 101", "delivery_date": future_date},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["stage"], "agenda_pending")

    def test_seller_can_accept_agenda_syncs_location_returns_200(self):
        SwapTransaction.objects.create(
            transaction=self.transaction,
            proposed_product=self.buyer_product,
            stage=SwapTransaction.Stage.AGENDA_PENDING,
            agenda_location="Edificio A · Salon 101",
        )
        self._auth(self.seller)
        response = self.client.patch(
            self._respond_agenda_url(),
            {"accept": True},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["stage"], "agenda_accepted")

        self.transaction.refresh_from_db()
        self.assertEqual(self.transaction.delivery_location, "Edificio A · Salon 101")

    def test_happy_path_full_swap_flow(self):
        self._auth(self.buyer)
        propose_resp = self.client.post(
            self._propose_url(),
            {"proposed_product_id": self.buyer_product.pk},
            format="json",
        )
        self.assertEqual(propose_resp.status_code, status.HTTP_201_CREATED)

        self._auth(self.seller)
        accept_resp = self.client.patch(
            self._respond_proposal_url(), {"accept": True}, format="json"
        )
        self.assertEqual(accept_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(accept_resp.data["stage"], "proposal_accepted")

        future_date = (timezone.now() + timedelta(days=3)).isoformat()
        self._auth(self.buyer)
        agenda_resp = self.client.patch(
            self._propose_agenda_url(),
            {"agenda_location": "Edificio D · Salon 201", "delivery_date": future_date},
            format="json",
        )
        self.assertEqual(agenda_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(agenda_resp.data["stage"], "agenda_pending")

        self._auth(self.seller)
        final_resp = self.client.patch(
            self._respond_agenda_url(), {"accept": True}, format="json"
        )
        self.assertEqual(final_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(final_resp.data["stage"], "agenda_accepted")

    def test_get_swap_state_returns_200(self):
        SwapTransaction.objects.create(
            transaction=self.transaction,
            proposed_product=self.buyer_product,
            stage=SwapTransaction.Stage.PROPOSAL_PENDING,
        )
        self._auth(self.buyer)
        response = self.client.get(self._get_swap_url())
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["stage"], "proposal_pending")
