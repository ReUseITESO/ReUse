import re

from django.utils import timezone
from rest_framework import serializers

from marketplace.models import Products
from marketplace.services.transaction_service import UPDATABLE_TRANSACTION_STATUSES


def _normalize_delivery_location(value):
    location_without_meeting = re.sub(
        r"\s*·\s*Reuni[oó]n\s+.+$",
        "",
        value,
        flags=re.IGNORECASE,
    ).strip()

    if not location_without_meeting:
        raise serializers.ValidationError("La ubicación de entrega es obligatoria.")

    return location_without_meeting


class TransactionCreateSerializer(serializers.Serializer):
    product_id = serializers.IntegerField(min_value=1)
    delivery_location = serializers.CharField(
        max_length=255,
        trim_whitespace=True,
        required=False,
        allow_blank=True,
    )
    delivery_date = serializers.DateTimeField(required=False, allow_null=True)
    swap_product_id = serializers.IntegerField(min_value=1, required=False)

    def validate_product_id(self, value):
        if not Products.objects.filter(pk=value).exists():
            raise serializers.ValidationError("El producto seleccionado no existe.")
        return value

    def validate_delivery_location(self, value):
        if not value:
            return value
        return _normalize_delivery_location(value)

    def validate_delivery_date(self, value):
        if value is None:
            return value

        if value <= timezone.now():
            raise serializers.ValidationError("La fecha de entrega debe ser futura.")
        return value

    def validate(self, attrs):
        product = Products.objects.filter(pk=attrs["product_id"]).values(
            "transaction_type"
        ).first()
        if product is None:
            raise serializers.ValidationError(
                {"product_id": "El producto seleccionado no existe."}
            )

        if product["transaction_type"] == "swap":
            if attrs.get("swap_product_id"):
                return attrs

            raise serializers.ValidationError(
                {
                    "swap_product_id": (
                        "Debes seleccionar un producto propio para proponer intercambio."
                    )
                }
            )

        if not attrs.get("delivery_location"):
            raise serializers.ValidationError(
                {"delivery_location": "La ubicación de entrega es obligatoria."}
            )

        if not attrs.get("delivery_date"):
            raise serializers.ValidationError(
                {"delivery_date": "La fecha de entrega es obligatoria."}
            )

        return attrs


class TransactionStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=UPDATABLE_TRANSACTION_STATUSES)


class SwapProposalSerializer(serializers.Serializer):
    swap_product_id = serializers.IntegerField(min_value=1)


class SwapMeetingProposalSerializer(serializers.Serializer):
    delivery_location = serializers.CharField(max_length=255, trim_whitespace=True)
    delivery_date = serializers.DateTimeField()

    def validate_delivery_location(self, value):
        return _normalize_delivery_location(value)

    def validate_delivery_date(self, value):
        if value <= timezone.now():
            raise serializers.ValidationError("La fecha de entrega debe ser futura.")

        return value


class SwapMeetingResponseSerializer(serializers.Serializer):
    accepted = serializers.BooleanField()
