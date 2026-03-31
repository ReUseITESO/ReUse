from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiParameter, extend_schema, extend_schema_view
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from marketplace.models import Transaction
from marketplace.serializers.transaction import (
    TransactionCreateSerializer,
    TransactionSerializer,
    TransactionStatusSerializer,
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
