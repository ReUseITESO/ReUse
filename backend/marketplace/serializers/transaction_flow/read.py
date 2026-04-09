from rest_framework import serializers

from marketplace.models import Products, Transaction
from marketplace.serializers.transaction_flow.common import (
    TransactionProductSerializer,
    TransactionUserSerializer,
)
from marketplace.services.transaction_service import (
    get_expiration_datetime,
    is_transaction_expired,
)
from marketplace.services.transaction_swap_context import (
    MEETING_PENDING,
    parse_swap_context,
    swap_meeting_status,
    visible_swap_location,
)


class TransactionSerializer(serializers.ModelSerializer):
    product = TransactionProductSerializer(read_only=True)
    seller = TransactionUserSerializer(read_only=True)
    buyer = TransactionUserSerializer(read_only=True)
    expires_at = serializers.SerializerMethodField()
    is_expired = serializers.SerializerMethodField()
    delivery_location = serializers.SerializerMethodField()
    swap_product = serializers.SerializerMethodField()
    swap_meeting_status = serializers.SerializerMethodField()
    swap_meeting_proposed_by = serializers.SerializerMethodField()

    def get_expires_at(self, obj):
        return get_expiration_datetime(obj)

    def get_is_expired(self, obj):
        return is_transaction_expired(obj)

    def get_delivery_location(self, obj):
        if obj.transaction_type != "swap":
            return obj.delivery_location
        return visible_swap_location(obj.delivery_location)

    def get_swap_product(self, obj):
        if obj.transaction_type != "swap":
            return None

        context = parse_swap_context(obj.delivery_location)
        if context is None:
            return None

        try:
            product = Products.objects.select_related("category").get(
                pk=context.swap_product_id
            )
        except Products.DoesNotExist:
            return None

        return TransactionProductSerializer(product).data

    def get_swap_meeting_status(self, obj):
        if obj.transaction_type != "swap":
            return None
        return swap_meeting_status(obj.delivery_location)

    def get_swap_meeting_proposed_by(self, obj):
        if obj.transaction_type != "swap":
            return None

        context = parse_swap_context(obj.delivery_location)
        if context is None or context.meeting_status != MEETING_PENDING:
            return None

        if context.meeting_proposer_id == obj.seller_id:
            return "seller"

        if context.meeting_proposer_id == obj.buyer_id:
            return "buyer"

        return None

    class Meta:
        model = Transaction
        fields = [
            "id",
            "product",
            "seller",
            "buyer",
            "transaction_type",
            "status",
            "seller_confirmation",
            "seller_confirmed_at",
            "buyer_confirmation",
            "buyer_confirmed_at",
            "delivery_date",
            "delivery_location",
            "swap_product",
            "swap_meeting_status",
            "swap_meeting_proposed_by",
            "created_at",
            "expires_at",
            "is_expired",
        ]
