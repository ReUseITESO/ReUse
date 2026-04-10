from django.db import IntegrityError
from django.db import transaction as db_transaction
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiParameter, extend_schema, extend_schema_view
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from marketplace.models import Transaction, TransactionReview
from marketplace.serializers.transaction import (
    TransactionCreateSerializer,
    TransactionHistorySerializer,
    TransactionSerializer,
    TransactionStatusSerializer,
)
from marketplace.serializers.transaction_review import (
    TransactionReviewCreateSerializer,
    TransactionReviewSerializer,
)
from marketplace.services.transaction_service import (
    create_transaction_request,
    list_transactions_for_user,
    update_transaction_status,
)


@extend_schema_view(
    list=extend_schema(
        summary="List my transactions",
        description=(
            "Returns transactions where the authenticated user participates as"
            " buyer or seller. Supports filtering by `role` and `status`."
        ),
        parameters=[
            OpenApiParameter(
                name="role",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                required=False,
                enum=["buyer", "seller"],
            ),
            OpenApiParameter(
                name="status",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                required=False,
                enum=["pendiente", "confirmada", "completada", "cancelada"],
            ),
        ],
        tags=["Marketplace > Transactions"],
    ),
    retrieve=extend_schema(
        summary="Get transaction detail",
        tags=["Marketplace > Transactions"],
    ),
    create=extend_schema(
        summary="Create transaction request",
        tags=["Marketplace > Transactions"],
    ),
)
class TransactionViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        role = self.request.query_params.get("role")
        status_filter = self.request.query_params.get("status")

        if role and role not in ["buyer", "seller"]:
            return Transaction.objects.none()

        valid_statuses = [choice for choice, _ in Transaction.STATUS_CHOICES]
        if status_filter and status_filter not in valid_statuses:
            return Transaction.objects.none()

        return list_transactions_for_user(
            user=self.request.user,
            role=role,
            status_filter=status_filter,
        )

    def get_serializer_class(self):
        if self.action == "create":
            return TransactionCreateSerializer
        if self.action == "change_status":
            return TransactionStatusSerializer
        return TransactionSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        transaction = create_transaction_request(
            product_id=serializer.validated_data["product_id"],
            buyer=request.user,
            delivery_location=serializer.validated_data["delivery_location"],
            delivery_date=serializer.validated_data["delivery_date"],
        )

        response_serializer = TransactionSerializer(
            transaction,
            context=self.get_serializer_context(),
        )
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    @extend_schema(
        summary="Change transaction status",
        description=(
            "Single status endpoint for transaction actions.\n"
            "- `confirmada`: accept request (seller only).\n"
            "- `cancelada`: cancel active request (buyer or seller).\n"
            "- `completada`: actor confirms delivery; transaction is marked"
            " completed only after both parties confirm."
        ),
        request=TransactionStatusSerializer,
        responses={200: TransactionSerializer},
        tags=["Marketplace > Transactions"],
    )
    @action(detail=True, methods=["patch"], url_path="status")
    def change_status(self, request, pk=None):
        transaction = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        updated_transaction = update_transaction_status(
            transaction_id=transaction.pk,
            new_status=serializer.validated_data["status"],
            actor=request.user,
        )

        response_serializer = TransactionSerializer(
            updated_transaction,
            context=self.get_serializer_context(),
        )
        return Response(response_serializer.data, status=status.HTTP_200_OK)

    @extend_schema(
        summary="Transaction history",
        description=(
            "Returns completed transactions for the authenticated user. "
            "Supports filtering by transaction_type, date_from, and date_to."
        ),
        parameters=[
            OpenApiParameter(
                name="transaction_type",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                required=False,
                enum=["donation", "sale", "swap"],
            ),
            OpenApiParameter(
                name="date_from",
                type=OpenApiTypes.DATE,
                location=OpenApiParameter.QUERY,
                required=False,
            ),
            OpenApiParameter(
                name="date_to",
                type=OpenApiTypes.DATE,
                location=OpenApiParameter.QUERY,
                required=False,
            ),
        ],
        responses={200: TransactionHistorySerializer(many=True)},
        tags=["Marketplace > Transactions"],
    )
    @action(detail=False, methods=["get"], url_path="history")
    def history(self, request):
        qs = list_transactions_for_user(user=request.user, status_filter="completada")

        tx_type = request.query_params.get("transaction_type")
        date_from = request.query_params.get("date_from")
        date_to = request.query_params.get("date_to")

        valid_types = [c for c, _ in Transaction.TRANSACTION_TYPE_CHOICES]
        if tx_type and tx_type in valid_types:
            qs = qs.filter(transaction_type=tx_type)
        if date_from:
            qs = qs.filter(created_at__date__gte=date_from)
        if date_to:
            qs = qs.filter(created_at__date__lte=date_to)

        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = TransactionHistorySerializer(
                page, many=True, context=self.get_serializer_context()
            )
            return self.get_paginated_response(serializer.data)

        serializer = TransactionHistorySerializer(
            qs, many=True, context=self.get_serializer_context()
        )
        return Response(serializer.data)

    @extend_schema(
        summary="Rate a completed transaction",
        description="Submit a 1-5 star rating and optional comment for a completed transaction. Each party can only submit one review per transaction.",
        request=TransactionReviewCreateSerializer,
        responses={201: TransactionReviewSerializer},
        tags=["Marketplace > Transactions"],
    )
    @action(detail=True, methods=["post"], url_path="review")
    def review(self, request, pk=None):
        transaction = self.get_object()

        if (
            transaction.seller_id != request.user.id
            and transaction.buyer_id != request.user.id
        ):
            return Response(
                {"detail": "No eres parte de esta transaccion."},
                status=status.HTTP_403_FORBIDDEN,
            )

        if transaction.status != "completada":
            return Response(
                {"detail": "Solo puedes calificar transacciones completadas."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if TransactionReview.objects.filter(
            transaction=transaction, reviewer=request.user
        ).exists():
            return Response(
                {"detail": "Ya calificaste esta transaccion."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = TransactionReviewCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        reviewee = (
            transaction.buyer
            if transaction.seller_id == request.user.id
            else transaction.seller
        )
        try:
            with db_transaction.atomic():
                review = TransactionReview.objects.create(
                    transaction=transaction,
                    reviewer=request.user,
                    reviewee=reviewee,
                    **serializer.validated_data,
                )
        except IntegrityError:
            return Response(
                {"detail": "Ya calificaste esta transaccion."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        response_serializer = TransactionReviewSerializer(
            review, context=self.get_serializer_context()
        )
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
