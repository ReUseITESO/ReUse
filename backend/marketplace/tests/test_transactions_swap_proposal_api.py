from rest_framework import status

from marketplace.models import Products
from marketplace.tests.transaction_swap_base import TransactionSwapApiBaseTestCase


class TransactionSwapProposalApiTests(TransactionSwapApiBaseTestCase):
    def test_create_swap_transaction_post_returns_201(self):
        response = self._create_swap_transaction()

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["transaction_type"], "swap")
        self.assertEqual(response.data["status"], "pendiente")
        self.assertEqual(response.data["swap_product"]["id"], self.buyer_swap_product.pk)
        self.assertEqual(response.data["swap_meeting_status"], "not_defined")

    def test_create_swap_transaction_without_swap_product_returns_400(self):
        self._auth(self.buyer)
        response = self.client.post(
            self.TRANSACTIONS_URL,
            {"product_id": self.swap_target_product.pk},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("swap_product_id", response.data["error"]["details"])

    def test_create_swap_transaction_with_foreign_swap_product_returns_403(self):
        foreign_product = Products.objects.create(
            seller=self.other_user,
            category=self.category,
            title="Producto ajeno",
            description="No debería permitirse",
            condition="usado",
            transaction_type="sale",
            status="disponible",
            price="80.00",
        )

        self._auth(self.buyer)
        response = self.client.post(
            self.TRANSACTIONS_URL,
            {
                "product_id": self.swap_target_product.pk,
                "swap_product_id": foreign_product.pk,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_mark_swap_no_accept_patch_keeps_pending(self):
        create_response = self._create_swap_transaction()
        transaction_id = create_response.data["id"]

        self._auth(self.seller)
        response = self.client.patch(self._swap_no_accept_url(transaction_id), {}, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["status"], "pendiente")

    def test_update_swap_proposal_patch_updates_proposed_product(self):
        create_response = self._create_swap_transaction()
        transaction_id = create_response.data["id"]

        self._auth(self.buyer)
        response = self.client.patch(
            self._swap_proposal_url(transaction_id),
            {"swap_product_id": self.alt_buyer_swap_product.pk},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["swap_product"]["id"], self.alt_buyer_swap_product.pk)
