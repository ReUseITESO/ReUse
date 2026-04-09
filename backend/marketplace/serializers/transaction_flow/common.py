from rest_framework import serializers

from core.models import User
from marketplace.models import Products
from marketplace.serializers.category import CategorySerializer


class TransactionUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "first_name", "last_name", "email"]


class TransactionProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)

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
        ]
