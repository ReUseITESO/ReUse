from rest_framework import viewsets

from marketplace.models import Category
from marketplace.serializers import CategorySerializer


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """ ViewSet para listar categorías. """
    serializer_class = CategorySerializer
    queryset = Category.objects.all()
