from rest_framework import serializers

from marketplace.models import Products
from marketplace.serializers.category import CategorySerializer
from marketplace.serializers.images import ImageSerializer


class ProductListSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    seller_name = serializers.CharField(source="seller.name", read_only=True)
    images = ImageSerializer(many=True, read_only=True)

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
            "images",
            "category",
            "seller_name",
            "created_at",
        ]


class ProductCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Products
        fields = [
            "id",
            "title",
            "description",
            "condition",
            "transaction_type",
            "price",
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
