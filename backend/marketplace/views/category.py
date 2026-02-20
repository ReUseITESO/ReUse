from rest_framework import viewsets
from drf_spectacular.utils import extend_schema, extend_schema_view

from marketplace.models import Category
from marketplace.serializers import CategorySerializer


@extend_schema_view(
    list=extend_schema(
        summary="Listar categorías",
        description="Retorna todas las categorías disponibles en el marketplace, ordenadas alfabéticamente.",
        tags=["Categorías"],
    ),
    retrieve=extend_schema(
        summary="Obtener detalle de una categoría",
        description="Retorna el detalle de una categoría por su ID.",
        tags=["Categorías"],
    ),
)
class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """ ViewSet para listar categorías del marketplace. """
    serializer_class = CategorySerializer
    queryset = Category.objects.all()
