from rest_framework import serializers

from marketplace.models import Products
from marketplace.serializers.category import CategorySerializer
from marketplace.serializers.product import ImageSerializer


class ProductDetailSerializer(serializers.ModelSerializer):
    """Serializer for product detail view with full information including images."""
    category = CategorySerializer(read_only=True)
    seller_name = serializers.SerializerMethodField()
    seller_email = serializers.EmailField(source='seller.email', read_only=True)
    images = ImageSerializer(many=True, read_only=True)

    def get_seller_name(self, obj):
        return obj.seller.get_full_name()

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
