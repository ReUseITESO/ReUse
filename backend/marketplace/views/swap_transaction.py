from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from marketplace.serializers.transaction_flow import (
    SwapAgendaSerializer,
    SwapProposalCreateSerializer,
    SwapRespondSerializer,
    SwapTransactionSerializer,
)
from marketplace.services.transaction_swap import (
    create_swap_proposal,
    get_swap_transaction,
    propose_swap_agenda,
    respond_to_agenda,
    respond_to_proposal,
)


@extend_schema_view(
    retrieve_swap=extend_schema(
        summary="Get swap state",
        tags=["Marketplace > Transactions > Swap"],
    ),
    propose=extend_schema(
        summary="Propose an item for swap",
        request=SwapProposalCreateSerializer,
        responses={201: SwapTransactionSerializer},
        tags=["Marketplace > Transactions > Swap"],
    ),
    respond_proposal=extend_schema(
        summary="Seller responds to swap proposal",
        request=SwapRespondSerializer,
        responses={200: SwapTransactionSerializer},
        tags=["Marketplace > Transactions > Swap"],
    ),
    propose_agenda=extend_schema(
        summary="Buyer proposes meeting date and location",
        request=SwapAgendaSerializer,
        responses={200: SwapTransactionSerializer},
        tags=["Marketplace > Transactions > Swap"],
    ),
    respond_agenda=extend_schema(
        summary="Seller responds to meeting agenda",
        request=SwapRespondSerializer,
        responses={200: SwapTransactionSerializer},
        tags=["Marketplace > Transactions > Swap"],
    ),
)
class SwapTransactionViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "propose":
            return SwapProposalCreateSerializer
        if self.action in ("respond_proposal", "respond_agenda"):
            return SwapRespondSerializer
        if self.action == "propose_agenda":
            return SwapAgendaSerializer
        return SwapTransactionSerializer

    @action(detail=True, methods=["get"], url_path="swap")
    def retrieve_swap(self, request, pk=None):
        swap = get_swap_transaction(transaction_id=pk)
        serializer = SwapTransactionSerializer(swap)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="swap/propose")
    def propose(self, request, pk=None):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        swap = create_swap_proposal(
            transaction_id=pk,
            proposed_product_id=serializer.validated_data["proposed_product_id"],
            buyer=request.user,
        )

        response_serializer = SwapTransactionSerializer(swap)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["patch"], url_path="swap/respond-proposal")
    def respond_proposal(self, request, pk=None):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        swap = respond_to_proposal(
            transaction_id=pk,
            accept=serializer.validated_data["accept"],
            actor=request.user,
        )

        response_serializer = SwapTransactionSerializer(swap)
        return Response(response_serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["patch"], url_path="swap/propose-agenda")
    def propose_agenda(self, request, pk=None):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        swap = propose_swap_agenda(
            transaction_id=pk,
            agenda_location=serializer.validated_data["agenda_location"],
            delivery_date=serializer.validated_data["delivery_date"],
            actor=request.user,
        )

        response_serializer = SwapTransactionSerializer(swap)
        return Response(response_serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["patch"], url_path="swap/respond-agenda")
    def respond_agenda(self, request, pk=None):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        swap = respond_to_agenda(
            transaction_id=pk,
            accept=serializer.validated_data["accept"],
            actor=request.user,
        )

        response_serializer = SwapTransactionSerializer(swap)
        return Response(response_serializer.data, status=status.HTTP_200_OK)
