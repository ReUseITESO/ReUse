from datetime import timedelta

from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from core.models import User
from marketplace.models import Category, Products


class SwapTransactionApiTests(APITestCase):
    URL = "/api/marketplace/transactions/"

    def setUp(self):
        self.seller = User.objects.create(
            email="swap_seller@iteso.mx", phone="3311111111"
        )
        self.buyer = User.objects.create(
            email="swap_buyer@iteso.mx", phone="3322222222"
        )
        self.category = Category.objects.create(name="Libros")
        self.target = Products.objects.create(
            seller=self.seller,
            category=self.category,
            title="Calculadora",
            description="Intercambio",
            condition="buen_estado",
            transaction_type="swap",
            status="disponible",
        )
        self.proposed_a = Products.objects.create(
            seller=self.buyer,
            category=self.category,
            title="Libro A",
            description="A",
            condition="usado",
            transaction_type="sale",
            status="disponible",
            price="50.00",
        )
        self.proposed_b = Products.objects.create(
            seller=self.buyer,
            category=self.category,
            title="Libro B",
            description="B",
            condition="como_nuevo",
            transaction_type="donation",
            status="disponible",
        )

    def _auth(self, user):
        self.client.force_authenticate(user=user)

    def _create_swap(self, proposed_product_id):
        self._auth(self.buyer)
        return self.client.post(
            self.URL,
            {"product_id": self.target.id, "proposed_product_id": proposed_product_id},
            format="json",
        )

    def test_create_swap_requires_proposed_product(self):
        self._auth(self.buyer)
        response = self.client.post(
            self.URL, {"product_id": self.target.id}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_swap_sets_both_products_in_process(self):
        response = self._create_swap(self.proposed_a.id)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["swap_stage"], "proposal_pending")
        self.target.refresh_from_db()
        self.proposed_a.refresh_from_db()
        self.assertEqual(self.target.status, "en_proceso")
        self.assertEqual(self.proposed_a.status, "en_proceso")

    def test_reject_proposal_keeps_pending_and_releases_product(self):
        transaction_id = self._create_swap(self.proposed_a.id).data["id"]
        self._auth(self.seller)
        response = self.client.patch(
            f"{self.URL}{transaction_id}/swap/proposal-decision/",
            {"accepted": False},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "pendiente")
        self.assertEqual(response.data["swap_stage"], "proposal_rejected")
        self.proposed_a.refresh_from_db()
        self.assertEqual(self.proposed_a.status, "disponible")

    def test_buyer_can_repropose_after_rejection(self):
        transaction_id = self._create_swap(self.proposed_a.id).data["id"]
        self._auth(self.seller)
        self.client.patch(
            f"{self.URL}{transaction_id}/swap/proposal-decision/",
            {"accepted": False},
            format="json",
        )
        self._auth(self.buyer)
        response = self.client.patch(
            f"{self.URL}{transaction_id}/swap/proposal/",
            {"proposed_product_id": self.proposed_b.id},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["swap_stage"], "proposal_pending")

    def test_swap_flow_accept_proposal_then_agenda_then_complete(self):
        transaction_id = self._create_swap(self.proposed_a.id).data["id"]
        self._auth(self.seller)
        self.client.patch(
            f"{self.URL}{transaction_id}/swap/proposal-decision/",
            {"accepted": True},
            format="json",
        )
        self._auth(self.buyer)
        agenda_response = self.client.patch(
            f"{self.URL}{transaction_id}/swap/agenda/",
            {
                "delivery_location": "Edificio A · Salon 101",
                "delivery_date": (timezone.now() + timedelta(days=1)).isoformat(),
            },
            format="json",
        )
        self.assertEqual(agenda_response.data["swap_stage"], "agenda_pending")

        self._auth(self.seller)
        accept_agenda = self.client.patch(
            f"{self.URL}{transaction_id}/swap/agenda-decision/",
            {"accepted": True},
            format="json",
        )
        self.assertEqual(accept_agenda.data["status"], "confirmada")

        self.client.patch(
            f"{self.URL}{transaction_id}/status/",
            {"status": "completada"},
            format="json",
        )
        self._auth(self.buyer)
        complete = self.client.patch(
            f"{self.URL}{transaction_id}/status/",
            {"status": "completada"},
            format="json",
        )
        self.assertEqual(complete.status_code, status.HTTP_200_OK)
        self.assertEqual(complete.data["status"], "completada")
        self.target.refresh_from_db()
        self.proposed_a.refresh_from_db()
        self.assertEqual(self.target.status, "completado")
        self.assertEqual(self.proposed_a.status, "completado")
