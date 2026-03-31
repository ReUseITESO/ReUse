import re

from django.utils import timezone
from rest_framework import serializers

from core.models import User
from marketplace.models import Products, Transaction
from marketplace.serializers.category import CategorySerializer
from marketplace.services.transaction_service import (
    UPDATABLE_TRANSACTION_STATUSES,
    get_expiration_datetime,
    is_transaction_expired,
)


class TransactionUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "first_name", "last_name", "email"]


class TransactionProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)

    class Meta:
        model = Products
        fields = [
            "id",
            "title",
            "description",
            "transaction_type",
            "status",
            "price",
            "image_url",
            "category",
        ]


class TransactionSerializer(serializers.ModelSerializer):
    product = TransactionProductSerializer(read_only=True)
    seller = TransactionUserSerializer(read_only=True)
    buyer = TransactionUserSerializer(read_only=True)
    expires_at = serializers.SerializerMethodField()
    is_expired = serializers.SerializerMethodField()

    def get_expires_at(self, obj):
        return get_expiration_datetime(obj)

    def get_is_expired(self, obj):
        return is_transaction_expired(obj)

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
            "created_at",
            "expires_at",
            "is_expired",
        ]


class TransactionCreateSerializer(serializers.Serializer):
    product_id = serializers.IntegerField(min_value=1)
    delivery_location = serializers.CharField(max_length=255, trim_whitespace=True)
    delivery_date = serializers.DateTimeField()

    def validate_product_id(self, value):
        if not Products.objects.filter(pk=value).exists():
            raise serializers.ValidationError("El producto seleccionado no existe.")
        return value

    def validate_delivery_location(self, value):
        # Keep only place data in DB (building/room or gate), strip any
        # legacy meeting text that might be sent by older frontend versions.
        location_without_meeting = re.sub(
            r"\s*·\s*Reuni[oó]n\s+.+$",
            "",
            value,
            flags=re.IGNORECASE,
        ).strip()

        if not location_without_meeting:
            raise serializers.ValidationError("La ubicación de entrega es obligatoria.")

        return location_without_meeting

    def validate_delivery_date(self, value):
        if value <= timezone.now():
            raise serializers.ValidationError(
                "La fecha de entrega debe ser futura."
            )
        return value


class TransactionStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=UPDATABLE_TRANSACTION_STATUSES)
