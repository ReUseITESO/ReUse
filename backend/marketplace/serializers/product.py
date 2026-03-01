from rest_framework import serializers

from marketplace.models import Products, Images
from marketplace.serializers.category import CategorySerializer


class ImageSerializer(serializers.ModelSerializer):
    """Serializer for product images."""
    
    class Meta:
        model = Images
        fields = ["id", "image_url", "order_number"]


class ProductListSerializer(serializers.ModelSerializer):
    """Serializer for the product list (Object -> JSON)."""
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


class ProductCreateSerializer(serializers.ModelSerializer):
    """Serializador para crear productos (JSON -> Obj)."""
    images = serializers.ListField(
        child=serializers.URLField(),
        required=False,
        allow_empty=True,
        help_text="Array de URLs de imágenes para el producto"
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
        images_data = validated_data.pop('images', [])
        product = Products.objects.create(**validated_data)
        
        # Create Images objects for each URL
        for index, image_url in enumerate(images_data):
            Images.objects.create(
                product=product,
                image_url=image_url,
                order_number=index
            )
        
        return product