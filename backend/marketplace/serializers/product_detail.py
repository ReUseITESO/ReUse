from rest_framework import serializers

from marketplace.models import Products, Transaction
from marketplace.serializers.category import CategorySerializer
from marketplace.serializers.product import ImageSerializer
from marketplace.serializers.reaction_fields import ReactionSerializerFieldsMixin


class ProductDetailSerializer(
    ReactionSerializerFieldsMixin, serializers.ModelSerializer
):
    """Serializer for product detail view with full information including images."""

    category = CategorySerializer(read_only=True)
    seller_name = serializers.SerializerMethodField()
    seller_id = serializers.IntegerField(source="seller.id", read_only=True)
    seller_email = serializers.EmailField(source="seller.email", read_only=True)
    images = ImageSerializer(many=True, read_only=True)
    has_active_transaction = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    dislikes_count = serializers.SerializerMethodField()
    user_reaction = serializers.SerializerMethodField()

    def get_seller_name(self, obj):
        return obj.seller.get_full_name()

    def get_has_active_transaction(self, obj):
        try:
            transaction = obj.transaction
        except Transaction.DoesNotExist:
            return False

        return transaction.status in ["pendiente", "confirmada"]

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
            "seller_email",
            "has_active_transaction",
            "likes_count",
            "dislikes_count",
            "user_reaction",
            "created_at",
            "images",
        ]
