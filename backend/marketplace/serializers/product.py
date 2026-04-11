from rest_framework import serializers

from marketplace.models import Products
from marketplace.serializers.category import CategorySerializer
from marketplace.serializers.images import ImageSerializer
from marketplace.serializers.reaction_fields import ReactionSerializerFieldsMixin
from marketplace.services.transaction_service import has_active_transaction
from social.serializers.community import CommunityListSerializer


class ProductListSerializer(ReactionSerializerFieldsMixin, serializers.ModelSerializer):
    """Serializer for the product list (Object -> JSON)."""

    category = CategorySerializer(read_only=True)
    community = CommunityListSerializer(read_only=True)
    seller_name = serializers.SerializerMethodField()
    seller_id = serializers.IntegerField(source="seller.id", read_only=True)
    images = ImageSerializer(many=True, read_only=True)
    has_active_transaction = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    dislikes_count = serializers.SerializerMethodField()
    user_reaction = serializers.SerializerMethodField()

    def get_seller_name(self, obj):
        return obj.seller.get_full_name()

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
            "community",
            "seller_name",
            "seller_id",
            "has_active_transaction",
            "likes_count",
            "dislikes_count",
            "user_reaction",
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
            "category",
            "community",
            "images",
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
            "category",
            "community",
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
