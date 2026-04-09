from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response

from marketplace.serializers.transaction import (
    SwapMeetingProposalSerializer,
    SwapMeetingResponseSerializer,
    SwapProposalSerializer,
    TransactionSerializer,
)
from marketplace.services.transaction_swap_service import (
    mark_swap_proposal_not_accepted,
    propose_swap_meeting,
    respond_swap_meeting,
    update_swap_proposal,
)


class SwapTransactionActionsMixin:
    def get_swap_serializer_class(self):
        action_serializers = {
            "update_swap_proposal": SwapProposalSerializer,
            "propose_swap_meeting": SwapMeetingProposalSerializer,
            "respond_swap_meeting": SwapMeetingResponseSerializer,
        }
        return action_serializers.get(self.action)

    @extend_schema(
        summary="Re-propose swap item",
        description=(
            "Allows the buyer to send a new item proposal while the swap request"
            " is still pending."
        ),
        request=SwapProposalSerializer,
        responses={200: TransactionSerializer},
        tags=["Marketplace > Transactions"],
    )
    @action(detail=True, methods=["patch"], url_path="swap-proposal")
    def update_swap_proposal(self, request, pk=None):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        updated_transaction = update_swap_proposal(
            transaction_id=self.get_object().pk,
            actor=request.user,
            swap_product_id=serializer.validated_data["swap_product_id"],
        )
        response_serializer = TransactionSerializer(
            updated_transaction,
            context=self.get_serializer_context(),
        )
        return Response(response_serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        summary="Mark swap proposal as not accepted",
        description=(
            "Seller can mark the current swap proposal as not accepted without"
            " cancelling the transaction, so the buyer may propose another item."
        ),
        request=None,
        responses={200: TransactionSerializer},
        tags=["Marketplace > Transactions"],
    )
    @action(detail=True, methods=["patch"], url_path="swap-no-accept")
    def mark_swap_no_accept(self, request, pk=None):
        updated_transaction = mark_swap_proposal_not_accepted(
            transaction_id=self.get_object().pk,
            actor=request.user,
        )
        response_serializer = TransactionSerializer(
            updated_transaction,
            context=self.get_serializer_context(),
        )
        return Response(response_serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        summary="Propose swap meeting",
        description=(
            "After swap proposal acceptance, either party may propose meeting"
            " date and location for counterpart approval."
        ),
        request=SwapMeetingProposalSerializer,
        responses={200: TransactionSerializer},
        tags=["Marketplace > Transactions"],
    )
    @action(detail=True, methods=["patch"], url_path="swap-meeting")
    def propose_swap_meeting(self, request, pk=None):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        updated_transaction = propose_swap_meeting(
            transaction_id=self.get_object().pk,
            actor=request.user,
            delivery_location=serializer.validated_data["delivery_location"],
            delivery_date=serializer.validated_data["delivery_date"],
        )
        response_serializer = TransactionSerializer(
            updated_transaction,
            context=self.get_serializer_context(),
        )
        return Response(response_serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        summary="Respond swap meeting proposal",
        description=(
            "Counterpart accepts or rejects pending meeting proposal."
            " Transaction stays in confirmada status in both outcomes."
        ),
        request=SwapMeetingResponseSerializer,
        responses={200: TransactionSerializer},
        tags=["Marketplace > Transactions"],
    )
    @action(detail=True, methods=["patch"], url_path="swap-meeting-response")
    def respond_swap_meeting(self, request, pk=None):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        updated_transaction = respond_swap_meeting(
            transaction_id=self.get_object().pk,
            actor=request.user,
            accepted=serializer.validated_data["accepted"],
        )
        response_serializer = TransactionSerializer(
            updated_transaction,
            context=self.get_serializer_context(),
        )
        return Response(response_serializer.data, status=status.HTTP_200_OK)
