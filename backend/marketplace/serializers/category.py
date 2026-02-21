from rest_framework import serializers

from marketplace.models import Category

class CategorySerializer(serializers.ModelSerializer):
    """Serializer for category (Object -> JSON)."""
    class Meta:
        model = Category
        fields = ["id", "name", "icon"]
