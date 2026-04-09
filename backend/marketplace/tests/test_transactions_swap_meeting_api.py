from datetime import timedelta

from django.utils import timezone
from rest_framework import status

from marketplace.models import Transaction
from marketplace.tests.transaction_swap_base import TransactionSwapApiBaseTestCase


class TransactionSwapMeetingApiTests(TransactionSwapApiBaseTestCase):
    def test_seller_accepts_swap_then_meeting_flow_works(self):
        create_response = self._create_swap_transaction()
        transaction_id = create_response.data["id"]

        self._auth(self.seller)
        accepted_response = self.client.patch(
            self._status_url(transaction_id),
            {"status": "confirmada"},
            format="json",
        )
        self.assertEqual(accepted_response.status_code, status.HTTP_200_OK)

        proposed_date = (timezone.now() + timedelta(days=2)).isoformat()
        meeting_response = self.client.patch(
            self._swap_meeting_url(transaction_id),
            {
                "delivery_location": "Edificio A · Salon 101",
                "delivery_date": proposed_date,
            },
            format="json",
        )
        self.assertEqual(meeting_response.status_code, status.HTTP_200_OK)
        self.assertEqual(meeting_response.data["swap_meeting_status"], "pending_acceptance")

        self._auth(self.buyer)
        accept_meeting_response = self.client.patch(
            self._swap_meeting_response_url(transaction_id),
            {"accepted": True},
            format="json",
        )

        self.assertEqual(accept_meeting_response.status_code, status.HTTP_200_OK)
        self.assertEqual(accept_meeting_response.data["status"], "confirmada")
        self.assertEqual(accept_meeting_response.data["swap_meeting_status"], "accepted")
        self.assertEqual(
            accept_meeting_response.data["delivery_location"],
            "Edificio A · Salon 101",
        )

    def test_meeting_proposer_cannot_respond_own_meeting(self):
        create_response = self._create_swap_transaction()
        transaction_id = create_response.data["id"]

        self._auth(self.seller)
        self.client.patch(self._status_url(transaction_id), {"status": "confirmada"}, format="json")
        self.client.patch(
            self._swap_meeting_url(transaction_id),
            {
                "delivery_location": "Puerta Sur",
                "delivery_date": (timezone.now() + timedelta(days=2)).isoformat(),
            },
            format="json",
        )

        response = self.client.patch(
            self._swap_meeting_response_url(transaction_id),
            {"accepted": True},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_reject_meeting_clears_schedule(self):
        create_response = self._create_swap_transaction()
        transaction_id = create_response.data["id"]

        self._auth(self.seller)
        self.client.patch(self._status_url(transaction_id), {"status": "confirmada"}, format="json")
        self.client.patch(
            self._swap_meeting_url(transaction_id),
            {
                "delivery_location": "Edificio B · Salon 201",
                "delivery_date": (timezone.now() + timedelta(days=3)).isoformat(),
            },
            format="json",
        )

        self._auth(self.buyer)
        response = self.client.patch(
            self._swap_meeting_response_url(transaction_id),
            {"accepted": False},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["swap_meeting_status"], "not_defined")
        self.assertIsNone(response.data["delivery_date"])

        transaction = Transaction.objects.get(pk=transaction_id)
        self.assertIsNone(transaction.delivery_date)
