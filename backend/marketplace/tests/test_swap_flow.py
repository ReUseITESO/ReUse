from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from core.models.user import User
from marketplace.models.category import Category
from marketplace.models.product import Products
from marketplace.models.transaction import Transaction
from marketplace.models.swap_transaction import SwapTransaction

class SwapFlowTests(APITestCase):
    def setUp(self):
        self.seller = User.objects.create(email="seller@iteso.mx", first_name="Seller")
        self.buyer = User.objects.create(email="buyer@iteso.mx", first_name="Buyer")
        self.category = Category.objects.create(name="Libros", icon="book")
        
        # Product 1 (Main)
        self.product1 = Products.objects.create(
            seller=self.seller,
            category=self.category,
            title="Book 1",
            transaction_type="swap",
            status="disponible"
        )
        
        # Product 2 (Proposed)
        self.product2 = Products.objects.create(
            seller=self.buyer,
            category=self.category,
            title="Book 2",
            transaction_type="swap",
            status="disponible"
        )

    def test_create_swap_proposal_sets_status_in_progress(self):
        self.client.force_authenticate(user=self.buyer)
        
        # Create transaction
        url = reverse("transactions-list")
        data = {
            "product_id": self.product1.id,
            "delivery_location": "Biblioteca",
            "delivery_date": "2026-05-01T12:00:00Z"
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        tx_id = response.data["id"]
        
        # Propose item
        url = reverse("swap-transactions-propose", args=[tx_id])
        data = {"proposed_product_id": self.product2.id}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Verify status
        self.product2.refresh_from_db()
        self.assertEqual(self.product2.status, "en_proceso")

    def test_reuse_transaction_with_swap_proposal(self):
        self.client.force_authenticate(user=self.buyer)
        
        # 1. Create transaction and proposal
        tx = Transaction.objects.create(
            product=self.product1, seller=self.seller, buyer=self.buyer,
            transaction_type="swap", status="pendiente"
        )
        SwapTransaction.objects.create(transaction=tx, proposed_product=self.product2)
        
        # 2. Cancel transaction
        tx.status = "cancelada"
        tx.save()
        self.product1.status = "disponible"
        self.product1.save()
        self.product2.status = "disponible"
        self.product2.save()
        
        # 3. Re-request via API
        url = reverse("transactions-list")
        data = {
            "product_id": self.product1.id,
            "delivery_location": "Nuevas coordenadas",
            "delivery_date": "2026-06-01T12:00:00Z"
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["id"], tx.id) # Should be the same ID (reused)
        
        # 4. Propose same or different item
        url = reverse("swap-transactions-propose", args=[tx.id])
        data = {"proposed_product_id": self.product2.id}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED) # Success! No conflict.
        
        self.product2.refresh_from_db()
        self.assertEqual(self.product2.status, "en_proceso")

    def test_reject_proposal_releases_product(self):
        self.client.force_authenticate(user=self.buyer)
        tx = Transaction.objects.create(
            product=self.product1, seller=self.seller, buyer=self.buyer,
            transaction_type="swap", status="pendiente"
        )
        SwapTransaction.objects.create(transaction=tx, proposed_product=self.product2)
        self.product2.status = "en_proceso"
        self.product2.save()
        
        # Seller rejects
        self.client.force_authenticate(user=self.seller)
        url = reverse("swap-transactions-respond-proposal", args=[tx.id])
        response = self.client.patch(url, {"accept": False}) # respond_proposal uses PATCH
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.product2.refresh_from_db()
        self.assertEqual(self.product2.status, "disponible")

    def test_cancel_transaction_releases_both_products(self):
        tx = Transaction.objects.create(
            product=self.product1, seller=self.seller, buyer=self.buyer,
            transaction_type="swap", status="pendiente"
        )
        SwapTransaction.objects.create(transaction=tx, proposed_product=self.product2)
        self.product1.status = "en_proceso"
        self.product1.save()
        self.product2.status = "en_proceso"
        self.product2.save()
        
        self.client.force_authenticate(user=self.seller)
        url = reverse("transactions-change-status", args=[tx.id])
        response = self.client.patch(url, {"status": "cancelada"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.product1.refresh_from_db()
        self.product2.refresh_from_db()
        self.assertEqual(self.product1.status, "disponible")
        self.assertEqual(self.product2.status, "disponible")

    def test_complete_transaction_marks_both_completed(self):
        tx = Transaction.objects.create(
            product=self.product1, seller=self.seller, buyer=self.buyer,
            transaction_type="swap", status="confirmada"
        )
        SwapTransaction.objects.create(transaction=tx, proposed_product=self.product2)
        self.product1.status = "en_proceso"
        self.product1.save()
        self.product2.status = "en_proceso"
        self.product2.save()
        
        # Seller confirms delivery
        self.client.force_authenticate(user=self.seller)
        url = reverse("transactions-change-status", args=[tx.id])
        self.client.patch(url, {"status": "completada"})
        
        # Buyer confirms receipt
        self.client.force_authenticate(user=self.buyer)
        self.client.patch(url, {"status": "completada"})
        
        self.product1.refresh_from_db()
        self.product2.refresh_from_db()
        self.assertEqual(self.product1.status, "completado")
        self.assertEqual(self.product2.status, "completado")
