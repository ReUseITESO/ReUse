from datetime import timedelta

from django.utils import timezone
from rest_framework.test import APITestCase

from core.models import User
from marketplace.models import Category, Products, SwapTransaction, Transaction
from marketplace.services.transaction_swap import (
    create_swap_proposal,
    propose_swap_agenda,
    respond_to_agenda,
    respond_to_proposal,
)


class SwapServiceTestCase(APITestCase):
    def setUp(self):
        self.seller = User.objects.create(
            email="seller_swap@iteso.mx",
            first_name="Ana",
            last_name="Vendedora",
            phone="3311111111",
        )
        self.buyer = User.objects.create(
            email="buyer_swap@iteso.mx",
            first_name="Luis",
            last_name="Comprador",
            phone="3322222222",
        )
        self.other = User.objects.create(
            email="other_swap@iteso.mx",
            first_name="Mia",
            last_name="Otro",
            phone="3333333333",
        )
        self.category = Category.objects.create(name="Libros")

        self.swap_product = Products.objects.create(
            seller=self.seller,
            category=self.category,
            title="Artículo de intercambio",
            description="Para intercambiar",
            condition="buen_estado",
            transaction_type="swap",
            status="disponible",
        )
        self.buyer_product = Products.objects.create(
            seller=self.buyer,
            category=self.category,
            title="Artículo del buyer",
            description="Lo que ofrece el buyer",
            condition="nuevo",
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

    def test_create_swap_proposal_returns_proposal_pending(self):
        swap = create_swap_proposal(
            transaction_id=self.transaction.pk,
            proposed_product_id=self.buyer_product.pk,
            buyer=self.buyer,
        )

        self.assertEqual(swap.stage, SwapTransaction.Stage.PROPOSAL_PENDING)
        self.assertEqual(swap.proposed_product_id, self.buyer_product.pk)

    def test_create_duplicate_proposal_updates_existing(self):
        SwapTransaction.objects.create(
            transaction=self.transaction,
            proposed_product=self.buyer_product,
            stage=SwapTransaction.Stage.PROPOSAL_PENDING,
        )
        # Should not raise exception, but update existing one (as per current service implementation)
        swap = create_swap_proposal(
            transaction_id=self.transaction.pk,
            proposed_product_id=self.buyer_product.pk,
            buyer=self.buyer,
        )
        self.assertEqual(swap.proposed_product_id, self.buyer_product.pk)

    def test_create_swap_proposal_with_non_owned_product_raises_permission_denied(self):
        from rest_framework.exceptions import PermissionDenied

        other_product = Products.objects.create(
            seller=self.other,
            category=self.category,
            title="No es mío",
            description="desc",
            condition="usado",
            transaction_type="swap",
            status="disponible",
        )

        with self.assertRaises(PermissionDenied):
            create_swap_proposal(
                transaction_id=self.transaction.pk,
                proposed_product_id=other_product.pk,
                buyer=self.buyer,
            )

    def test_respond_proposal_accept_changes_stage_to_accepted(self):
        swap = SwapTransaction.objects.create(
            transaction=self.transaction,
            proposed_product=self.buyer_product,
            stage=SwapTransaction.Stage.PROPOSAL_PENDING,
        )

        swap = respond_to_proposal(
            transaction_id=self.transaction.pk,
            accept=True,
            actor=self.seller,
        )

        self.assertEqual(swap.stage, SwapTransaction.Stage.PROPOSAL_ACCEPTED)
        self.assertIsNotNone(swap.proposal_decided_at)

    def test_respond_proposal_reject_changes_stage_to_rejected(self):
        SwapTransaction.objects.create(
            transaction=self.transaction,
            proposed_product=self.buyer_product,
            stage=SwapTransaction.Stage.PROPOSAL_PENDING,
        )

        swap = respond_to_proposal(
            transaction_id=self.transaction.pk,
            accept=False,
            actor=self.seller,
        )

        self.assertEqual(swap.stage, SwapTransaction.Stage.PROPOSAL_REJECTED)

    def test_buyer_cannot_respond_to_proposal(self):
        from rest_framework.exceptions import PermissionDenied

        SwapTransaction.objects.create(
            transaction=self.transaction,
            proposed_product=self.buyer_product,
            stage=SwapTransaction.Stage.PROPOSAL_PENDING,
        )

        with self.assertRaises(PermissionDenied):
            respond_to_proposal(
                transaction_id=self.transaction.pk,
                accept=True,
                actor=self.buyer,
            )

    def test_propose_agenda_sets_stage_to_agenda_pending(self):
        SwapTransaction.objects.create(
            transaction=self.transaction,
            proposed_product=self.buyer_product,
            stage=SwapTransaction.Stage.PROPOSAL_ACCEPTED,
        )
        future_date = timezone.now() + timedelta(days=3)

        swap = propose_swap_agenda(
            transaction_id=self.transaction.pk,
            agenda_location="Edificio D · Salon 201",
            delivery_date=future_date,
            actor=self.buyer,
        )

        self.assertEqual(swap.stage, SwapTransaction.Stage.AGENDA_PENDING)
        self.assertEqual(swap.agenda_location, "Edificio D · Salon 201")

    def test_seller_cannot_propose_agenda(self):
        from rest_framework.exceptions import PermissionDenied

        SwapTransaction.objects.create(
            transaction=self.transaction,
            proposed_product=self.buyer_product,
            stage=SwapTransaction.Stage.PROPOSAL_ACCEPTED,
        )

        with self.assertRaises(PermissionDenied):
            propose_swap_agenda(
                transaction_id=self.transaction.pk,
                agenda_location="Edificio D · Salon 201",
                delivery_date=timezone.now() + timedelta(days=3),
                actor=self.seller,
            )

    def test_respond_agenda_accept_syncs_delivery_location(self):
        SwapTransaction.objects.create(
            transaction=self.transaction,
            proposed_product=self.buyer_product,
            stage=SwapTransaction.Stage.AGENDA_PENDING,
            agenda_location="Edificio D · Salon 201",
        )

        swap = respond_to_agenda(
            transaction_id=self.transaction.pk,
            accept=True,
            actor=self.seller,
        )

        self.assertEqual(swap.stage, SwapTransaction.Stage.AGENDA_ACCEPTED)
        self.transaction.refresh_from_db()
        self.assertEqual(self.transaction.delivery_location, "Edificio D · Salon 201")

    def test_respond_agenda_reject_changes_stage_to_rejected(self):
        SwapTransaction.objects.create(
            transaction=self.transaction,
            proposed_product=self.buyer_product,
            stage=SwapTransaction.Stage.AGENDA_PENDING,
            agenda_location="Edificio D · Salon 201",
        )

        swap = respond_to_agenda(
            transaction_id=self.transaction.pk,
            accept=False,
            actor=self.seller,
        )

        self.assertEqual(swap.stage, SwapTransaction.Stage.AGENDA_REJECTED)
