import re

from django.utils import timezone
from rest_framework import serializers

from marketplace.models import Products, SwapTransaction
from marketplace.serializers.category import CategorySerializer


class SwapProposedProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Products
        fields = ["id", "title", "description", "status", "image_url", "category"]

    def get_image_url(self, obj):
        first = obj.images.order_by("order_number").first()
        return first.image_url if first else None


class SwapTransactionSerializer(serializers.ModelSerializer):
    proposed_product = SwapProposedProductSerializer(read_only=True)

    class Meta:
        model = SwapTransaction
        fields = [
            "id",
            "stage",
            "proposed_product",
            "agenda_location",
            "proposal_decided_at",
            "agenda_decided_at",
            "created_at",
            "updated_at",
        ]


class SwapProposalCreateSerializer(serializers.Serializer):
    proposed_product_id = serializers.IntegerField(min_value=1)

    def validate_proposed_product_id(self, value):
        if not Products.objects.filter(pk=value).exists():
            raise serializers.ValidationError("El artículo propuesto no existe.")
        return value


class SwapAgendaSerializer(serializers.Serializer):
    agenda_location = serializers.CharField(max_length=255, trim_whitespace=True)
    delivery_date = serializers.DateTimeField()

    def validate_agenda_location(self, value):
        cleaned = re.sub(
            r"\s*·\s*Reuni[oó]n\s+.+$", "", value, flags=re.IGNORECASE
        ).strip()
        if not cleaned:
            raise serializers.ValidationError("La ubicación de la agenda es obligatoria.")
        return cleaned

    def validate_delivery_date(self, value):
        if value <= timezone.now():
            raise serializers.ValidationError("La fecha de encuentro debe ser futura.")
        return value


class SwapRespondSerializer(serializers.Serializer):
    accept = serializers.BooleanField()
