from rest_framework import serializers

from marketplace.models import Category


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for product categories."""

    class Meta:
        model = Category
        fields = ["id", "name", "icon"]
