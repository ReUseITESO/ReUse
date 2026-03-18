from rest_framework import status
from rest_framework.test import APITestCase

from core.models import User
from marketplace.models import Category, Products, Transaction


class ProductStatusTests(APITestCase):
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
        self.buyer = User.objects.create(
            email="buyer@iteso.mx",
            first_name="Lucia",
            last_name="Ramirez",
            phone="3312345680",
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
        self.client.force_authenticate(user=user)

    def _status_url(self, product_id=None):
        product_id = product_id or self.product.pk
        return f"{self.PRODUCTS_URL}{product_id}/status/"

    def _create_transaction(self, tx_status):
        return Transaction.objects.create(
            product=self.product,
            seller=self.seller,
            buyer=self.buyer,
            transaction_type=self.product.transaction_type,
            delivery_location="Campus ITESO",
            status=tx_status,
        )

    def test_change_status_disponible_to_en_proceso_returns_200(self):
        self._auth()
        response = self.client.patch(
            self._status_url(),
            {"status": "en_proceso"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "en_proceso")

    def test_change_status_disponible_to_cancelado_returns_200(self):
        self._auth()
        response = self.client.patch(
            self._status_url(),
            {"status": "cancelado"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "cancelado")

    def test_change_status_disponible_to_pausado_returns_200(self):
        self._auth()
        response = self.client.patch(
            self._status_url(),
            {"status": "pausado"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "pausado")

    def test_change_status_pausado_to_disponible_returns_200(self):
        self.product.status = "pausado"
        self.product.save(update_fields=["status"])
        self._auth()
        response = self.client.patch(
            self._status_url(),
            {"status": "disponible"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "disponible")

    def test_change_status_pausado_to_cancelado_returns_200(self):
        self.product.status = "pausado"
        self.product.save(update_fields=["status"])
        self._auth()
        response = self.client.patch(
            self._status_url(),
            {"status": "cancelado"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "cancelado")

    def test_change_status_en_proceso_to_completado_returns_200(self):
        self.product.status = "en_proceso"
        self.product.save(update_fields=["status"])
        self._auth()
        response = self.client.patch(
            self._status_url(),
            {"status": "completado"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "completado")

    def test_change_status_en_proceso_back_to_disponible_returns_200(self):
        self.product.status = "en_proceso"
        self.product.save(update_fields=["status"])
        self._auth()
        response = self.client.patch(
            self._status_url(),
            {"status": "disponible"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "disponible")

    def test_change_status_invalid_transition_returns_400(self):
        self._auth()
        response = self.client.patch(
            self._status_url(),
            {"status": "completado"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_change_status_pausado_to_en_proceso_returns_400(self):
        self.product.status = "pausado"
        self.product.save(update_fields=["status"])
        self._auth()
        response = self.client.patch(
            self._status_url(),
            {"status": "en_proceso"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_change_status_to_pausado_with_pending_transaction_returns_409(self):
        self._create_transaction("pendiente")
        self._auth()
        response = self.client.patch(
            self._status_url(),
            {"status": "pausado"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)

    def test_change_status_to_pausado_with_confirmed_transaction_returns_409(self):
        self._create_transaction("confirmada")
        self._auth()
        response = self.client.patch(
            self._status_url(),
            {"status": "pausado"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)

    def test_change_status_from_completado_returns_400(self):
        self.product.status = "completado"
        self.product.save(update_fields=["status"])
        self._auth()
        response = self.client.patch(
            self._status_url(),
            {"status": "disponible"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_change_status_from_cancelado_returns_400(self):
        self.product.status = "cancelado"
        self.product.save(update_fields=["status"])
        self._auth()
        response = self.client.patch(
            self._status_url(),
            {"status": "disponible"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_change_status_without_auth_returns_401(self):
        response = self.client.patch(
            self._status_url(),
            {"status": "en_proceso"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_change_status_other_user_returns_403(self):
        self._auth(self.other_user)
        response = self.client.patch(
            self._status_url(),
            {"status": "en_proceso"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_change_status_invalid_value_returns_400(self):
        self._auth()
        response = self.client.patch(
            self._status_url(),
            {"status": "invalid_status"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_change_status_empty_body_returns_400(self):
        self._auth()
        response = self.client.patch(
            self._status_url(),
            {},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_change_status_nonexistent_product_returns_404(self):
        self._auth()
        response = self.client.patch(
            f"{self.PRODUCTS_URL}99999/status/",
            {"status": "en_proceso"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
