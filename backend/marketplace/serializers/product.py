from rest_framework import serializers

from marketplace.models import Products
from marketplace.serializers.category import CategorySerializer


class ProductListSerializer(serializers.ModelSerializer):
    """Serializer for the product list (Object -> JSON)."""
    category = CategorySerializer(read_only=True)
    seller_name = serializers.CharField(
        source='seller.name', read_only=True
    )
    seller_id = serializers.IntegerField(
        source='seller.id', read_only=True
    )

    class Meta:
        model = Products
        fields = [
            "id",
            "title",
            "description",
            "condition",
            "transaction_type",
            "status",
            "price",
            "image_url",
            "category",
            "seller_name",
            "seller_id",
            "created_at",
            "updated_at",
        ]


class ProductCreateSerializer(serializers.ModelSerializer):
    """Serializador para crear productos (JSON -> Obj)."""

    class Meta:
        model = Products
        fields = [
            "id",
            "title",
            "description",
            "condition",
            "transaction_type",
            "price",
            "image_url",
            "category",
        ]
        read_only_fields = ["id"]

    def validate(self, data):
        transaction_type = data.get("transaction_type")
        price = data.get("price")

        if transaction_type == "donation" and price is not None:
            raise serializers.ValidationError(
                {"price": "Las donaciones no deben tener precio."}
            )

        if transaction_type == "sale" and (price is None or price <= 0):
            raise serializers.ValidationError(
                {"price": "Las ventas deben tener un precio mayor a 0."}
            )

        return data


class ProductUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating products (PATCH)."""

    class Meta:
        model = Products
        fields = [
            "title",
            "description",
            "condition",
            "transaction_type",
            "price",
            "image_url",
            "category",
        ]

    def validate(self, data):
        instance = self.instance
        transaction_type = data.get(
            "transaction_type",
            instance.transaction_type if instance else None,
        )
        price = data.get(
            "price",
            instance.price if instance else None,
        )

        if "transaction_type" in data or "price" in data:
            if transaction_type == "donation" and price is not None:
                raise serializers.ValidationError(
                    {"price": "Las donaciones no deben tener precio."}
                )
            if transaction_type == "sale" and (price is None or price <= 0):
                raise serializers.ValidationError(
                    {"price": "Las ventas deben tener un precio mayor a 0."}
                )

        return data


class ProductStatusSerializer(serializers.Serializer):
    """Serializer for validating status change input."""
    status = serializers.ChoiceField(
        choices=Products.STATUS_CHOICES,
    )