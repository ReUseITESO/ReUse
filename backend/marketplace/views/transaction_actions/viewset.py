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
from marketplace.views.transaction_actions.schemas import (
    CHANGE_STATUS_SCHEMA,
    TRANSACTION_VIEWSET_SCHEMA,
)
from marketplace.views.transaction_actions.swap_actions import (
    SwapTransactionActionsMixin,
)


@TRANSACTION_VIEWSET_SCHEMA
class TransactionViewSet(
    SwapTransactionActionsMixin,
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

        swap_serializer_class = self.get_swap_serializer_class()
        if swap_serializer_class is not None:
            return swap_serializer_class

        return TransactionSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        transaction = create_transaction_request(
            product_id=serializer.validated_data["product_id"],
            buyer=request.user,
            delivery_location=serializer.validated_data.get("delivery_location"),
            delivery_date=serializer.validated_data.get("delivery_date"),
            swap_product_id=serializer.validated_data.get("swap_product_id"),
        )

        response_serializer = TransactionSerializer(
            transaction,
            context=self.get_serializer_context(),
        )
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    @CHANGE_STATUS_SCHEMA
    @action(detail=True, methods=["patch"], url_path="status")
    def change_status(self, request, pk=None):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        updated_transaction = update_transaction_status(
            transaction_id=self.get_object().pk,
            new_status=serializer.validated_data["status"],
            actor=request.user,
        )

        response_serializer = TransactionSerializer(
            updated_transaction,
            context=self.get_serializer_context(),
        )
        return Response(response_serializer.data, status=status.HTTP_200_OK)
