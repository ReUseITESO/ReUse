from rest_framework import serializers

from marketplace.models import Products, Images
from marketplace.serializers.category import CategorySerializer


class ImageSerializer(serializers.ModelSerializer):
    """Serializer for product images."""
    
    class Meta:
        model = Images
        fields = ["id", "image_url", "order_number"]


class ProductDetailSerializer(serializers.ModelSerializer):
    """Serializer for product detail view with full information including images."""
    category = CategorySerializer(read_only=True)
    seller_name = serializers.CharField(source='seller.name', read_only=True)
    seller_email = serializers.EmailField(source='seller.email', read_only=True)
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
            "image_url",
            "category",
            "seller_name",
            "seller_email",
            "created_at",
            "images",
        ]
