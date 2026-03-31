from datetime import timedelta

from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from core.models import User
from gamification.models.point_rule import PointRule
from marketplace.models import Category, Products, Transaction


class TransactionApiTests(APITestCase):
    TRANSACTIONS_URL = "/api/marketplace/transactions/"

    def setUp(self):
        self.seller = User.objects.create(
            email="seller_tx@iteso.mx",
            first_name="Ana",
            last_name="Seller",
            phone="3311111111",
        )
        self.buyer = User.objects.create(
            email="buyer_tx@iteso.mx",
            first_name="Luis",
            last_name="Buyer",
            phone="3322222222",
        )
        self.other_user = User.objects.create(
            email="other_tx@iteso.mx",
            first_name="Mia",
            last_name="Other",
            phone="3333333333",
        )

        self.category = Category.objects.create(name="Libros")

        self.product = Products.objects.create(
            seller=self.seller,
            category=self.category,
            title="Libro Base",
            description="Descripción base",
            condition="buen_estado",
            transaction_type="sale",
            status="disponible",
            price="120.00",
        )

        PointRule.objects.create(action="complete_sale", points=15, is_active=True)
        PointRule.objects.create(action="complete_donation", points=20, is_active=True)
        PointRule.objects.create(action="complete_exchange", points=18, is_active=True)

    def _auth(self, user):
        self.client.force_authenticate(user=user)

    def _create_transaction(self, user=None, product_id=None):
        actor = user or self.buyer
        target_product_id = product_id or self.product.pk
        self._auth(actor)
        return self.client.post(
            self.TRANSACTIONS_URL,
            {
                "product_id": target_product_id,
                "delivery_location": "Biblioteca ITESO",
            },
            format="json",
        )

    def _status_url(self, transaction_id):
        return f"{self.TRANSACTIONS_URL}{transaction_id}/status/"

    def test_list_without_auth_returns_401(self):
        response = self.client.get(self.TRANSACTIONS_URL)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_transaction_returns_201(self):
        response = self._create_transaction()

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.product.refresh_from_db()
        self.assertEqual(self.product.status, "en_proceso")

    def test_create_own_product_returns_403(self):
        response = self._create_transaction(user=self.seller)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_transaction_for_non_available_product_returns_409(self):
        self.product.status = "pausado"
        self.product.save(update_fields=["status", "updated_at"])

        response = self._create_transaction()
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)

    def test_create_transaction_when_active_exists_returns_409(self):
        self._create_transaction(user=self.buyer)

        other_product = Products.objects.create(
            seller=self.seller,
            category=self.category,
            title="Libro 2",
            description="Descripción 2",
            condition="usado",
            transaction_type="sale",
            status="disponible",
            price="90.00",
        )
        self._create_transaction(user=self.other_user, product_id=other_product.pk)

        response = self._create_transaction(user=self.other_user)
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)

    def test_seller_can_accept_transaction_with_status_confirmada(self):
        create_response = self._create_transaction()
        transaction_id = create_response.data["id"]

        self._auth(self.seller)
        response = self.client.patch(
            self._status_url(transaction_id),
            {"status": "confirmada"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "confirmada")

    def test_buyer_cannot_accept_transaction(self):
        create_response = self._create_transaction()
        transaction_id = create_response.data["id"]

        self._auth(self.buyer)
        response = self.client.patch(
            self._status_url(transaction_id),
            {"status": "confirmada"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_invalid_transition_pending_to_completed_returns_409(self):
        create_response = self._create_transaction()
        transaction_id = create_response.data["id"]

        self._auth(self.buyer)
        response = self.client.patch(
            self._status_url(transaction_id),
            {"status": "completada"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)

    def test_cancel_pending_returns_product_to_disponible(self):
        create_response = self._create_transaction()
        transaction_id = create_response.data["id"]

        self._auth(self.buyer)
        response = self.client.patch(
            self._status_url(transaction_id),
            {"status": "cancelada"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.product.refresh_from_db()
        self.assertEqual(self.product.status, "disponible")

    def test_create_transaction_after_cancellation_allows_new_request(self):
        create_response = self._create_transaction(user=self.buyer)
        transaction_id = create_response.data["id"]

        self._auth(self.buyer)
        cancel_response = self.client.patch(
            self._status_url(transaction_id),
            {"status": "cancelada"},
            format="json",
        )
        self.assertEqual(cancel_response.status_code, status.HTTP_200_OK)

        reopen_response = self._create_transaction(user=self.other_user)
        self.assertEqual(reopen_response.status_code, status.HTTP_201_CREATED)

        self.assertEqual(Transaction.objects.filter(product=self.product).count(), 1)

        transaction = Transaction.objects.get(product=self.product)
        self.assertEqual(transaction.status, "pendiente")
        self.assertEqual(transaction.buyer_id, self.other_user.id)
        self.assertFalse(transaction.seller_confirmation)
        self.assertFalse(transaction.buyer_confirmation)

    def test_first_delivery_confirmation_keeps_status_confirmada(self):
        create_response = self._create_transaction()
        transaction_id = create_response.data["id"]

        self._auth(self.seller)
        self.client.patch(
            self._status_url(transaction_id),
            {"status": "confirmada"},
            format="json",
        )

        response = self.client.patch(
            self._status_url(transaction_id),
            {"status": "completada"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "confirmada")
        self.assertTrue(response.data["seller_confirmation"])
        self.assertFalse(response.data["buyer_confirmation"])

    def test_second_delivery_confirmation_completes_transaction_and_awards_points(self):
        create_response = self._create_transaction()
        transaction_id = create_response.data["id"]

        self._auth(self.seller)
        self.client.patch(
            self._status_url(transaction_id),
            {"status": "confirmada"},
            format="json",
        )
        self.client.patch(
            self._status_url(transaction_id),
            {"status": "completada"},
            format="json",
        )

        self._auth(self.buyer)
        response = self.client.patch(
            self._status_url(transaction_id),
            {"status": "completada"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "completada")

        self.product.refresh_from_db()
        self.assertEqual(self.product.status, "completado")

        self.seller.refresh_from_db()
        self.buyer.refresh_from_db()
        self.assertEqual(self.seller.points, 15)
        self.assertEqual(self.buyer.points, 15)

    def test_second_delivery_confirmation_without_point_rule_returns_200(self):
        PointRule.objects.filter(action="complete_sale").delete()

        create_response = self._create_transaction()
        transaction_id = create_response.data["id"]

        self._auth(self.seller)
        self.client.patch(
            self._status_url(transaction_id),
            {"status": "confirmada"},
            format="json",
        )
        self.client.patch(
            self._status_url(transaction_id),
            {"status": "completada"},
            format="json",
        )

        self._auth(self.buyer)
        response = self.client.patch(
            self._status_url(transaction_id),
            {"status": "completada"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "completada")

        self.seller.refresh_from_db()
        self.buyer.refresh_from_db()
        self.assertEqual(self.seller.points, 0)
        self.assertEqual(self.buyer.points, 0)

    def test_expired_transaction_is_cancelled_on_status_update(self):
        create_response = self._create_transaction()
        transaction_id = create_response.data["id"]

        Transaction.objects.filter(pk=transaction_id).update(
            created_at=timezone.now() - timedelta(hours=25)
        )

        self._auth(self.seller)
        response = self.client.patch(
            self._status_url(transaction_id),
            {"status": "confirmada"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)

        transaction = Transaction.objects.get(pk=transaction_id)
        self.assertEqual(transaction.status, "cancelada")

        self.product.refresh_from_db()
        self.assertEqual(self.product.status, "disponible")

    def test_list_transactions_supports_role_and_status_filters(self):
        create_response = self._create_transaction(user=self.buyer)
        transaction_id = create_response.data["id"]

        self._auth(self.seller)
        self.client.patch(
            self._status_url(transaction_id),
            {"status": "confirmada"},
            format="json",
        )

        response = self.client.get(
            self.TRANSACTIONS_URL,
            {"role": "seller", "status": "confirmada"},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
