from rest_framework import serializers

from marketplace.models import Products
from marketplace.serializers.category import CategorySerializer


class ProductListSerializer(serializers.ModelSerializer):
    """Serializer for the product list representation."""

    category = CategorySerializer(read_only=True)
    seller_name = serializers.CharField(
        source='seller.name', read_only=True
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
            "created_at",
        ]