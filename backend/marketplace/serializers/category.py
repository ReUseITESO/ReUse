from rest_framework import serializers

from marketplace.models import Category

class CategorySerializer(serializers.ModelSerializer):
    """ Serializador para la categoría (Obj -> JSON). """
    class Meta:
        model = Category
        fields = ["id", "name", "icon"]
