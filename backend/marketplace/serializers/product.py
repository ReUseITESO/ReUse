from rest_framework import serializers

# GAMIFICATION imports
from gamification.services.point_service import award_points
from marketplace.models import Images, Products
from marketplace.serializers.category import CategorySerializer


class ImageSerializer(serializers.ModelSerializer):
    """Serializer for product images."""

    class Meta:
        model = Images
        fields = ["id", "image_url", "order_number"]


class ProductListSerializer(serializers.ModelSerializer):
    """Serializer for the product list (Object -> JSON)."""

    category = CategorySerializer(read_only=True)
    seller_name = serializers.SerializerMethodField()
    seller_id = serializers.IntegerField(source="seller.id", read_only=True)

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
            "seller_id",
            "created_at",
            "updated_at",
        ]


class ProductCreateSerializer(serializers.ModelSerializer):
    """Serializador para crear productos (JSON -> Obj)."""

    images = serializers.ListField(
        child=serializers.URLField(),
        required=False,
        allow_empty=True,
        help_text="Array de URLs de imágenes para el producto",
    )

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

    def create(self, validated_data):
        images_data = validated_data.pop("images", [])
        product = Products.objects.create(**validated_data)

        # === GAMIFICATION: Award points to the seller for publishing an item ===
        award_points(
            user=product.seller, action="publish_item", reference_id=product.id
        )

        # ==========================================================================

        # Create Images objects for each URL
        for index, image_url in enumerate(images_data):
            Images.objects.create(
                product=product, image_url=image_url, order_number=index
            )

        return product


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
