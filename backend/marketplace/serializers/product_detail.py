from rest_framework import serializers

from marketplace.models import Products
from marketplace.serializers.category import CategorySerializer
from marketplace.serializers.images import ImageSerializer
from marketplace.serializers.reaction_fields import ReactionSerializerFieldsMixin
from marketplace.services.transaction_service import has_active_transaction


class ProductDetailSerializer(
    ReactionSerializerFieldsMixin, serializers.ModelSerializer
):
    """Serializer for product detail view with full information including images."""

    category = CategorySerializer(read_only=True)
    seller_name = serializers.SerializerMethodField()

    seller_id = serializers.IntegerField(source="seller.id", read_only=True)
    seller_email = serializers.SerializerMethodField()

    images = ImageSerializer(many=True, read_only=True)
    has_active_transaction = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    dislikes_count = serializers.SerializerMethodField()
    user_reaction = serializers.SerializerMethodField()

    def get_seller_name(self, obj):
        # HU-CORE-17: ocultar nombre si el vendedor está desactivado
        if getattr(obj.seller, "is_deactivated", False):
            return "Usuario Desactivado"
        return obj.seller.get_full_name()

    def get_seller_email(self, obj):
        # HU-CORE-17: ocultar email si el vendedor está desactivado
        if getattr(obj.seller, "is_deactivated", False):
            return ""
        return obj.seller.email

    def get_has_active_transaction(self, obj):
        return has_active_transaction(obj)

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
            "seller_id",
            "seller_email",
            "has_active_transaction",
            "likes_count",
            "dislikes_count",
            "user_reaction",
            "created_at",
        ]
