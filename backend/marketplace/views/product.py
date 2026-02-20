from rest_framework import filters, viewsets
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter
from drf_spectacular.types import OpenApiTypes

from marketplace.models import Products
from marketplace.serializers import ProductListSerializer


@extend_schema_view(
    list=extend_schema(
        summary="Listar productos disponibles",
        description=(
            "Retorna una lista paginada de productos con estado *disponible*. "
            "Permite filtrar por categoría, condición y tipo de transacción, "
            "y buscar por texto en título, descripción o nombre de categoría."
        ),
        parameters=[
            OpenApiParameter(
                name="category",
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
                description="ID de la categoría (ej. 1 para Libros).",
                required=False,
            ),
            OpenApiParameter(
                name="condition",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description="Condición del producto: `nuevo`, `como_nuevo`, `buen_estado`, `usado`.",
                required=False,
                enum=["nuevo", "como_nuevo", "buen_estado", "usado"],
            ),
            OpenApiParameter(
                name="transaction_type",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description="Tipo de transacción: `sale`, `donation`, `swap`.",
                required=False,
                enum=["sale", "donation", "swap"],
            ),
            OpenApiParameter(
                name="search",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description="Búsqueda de texto libre en título, descripción y nombre de categoría.",
                required=False,
            ),
            OpenApiParameter(
                name="ordering",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description="Ordenamiento: `created_at`, `price`, `title` (prefija con `-` para descendente).",
                required=False,
            ),
        ],
        tags=["Productos"],
    ),
    retrieve=extend_schema(
        summary="Obtener detalle de un producto",
        description="Retorna el detalle completo de un producto por su ID.",
        tags=["Productos"],
    ),
)
class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    """ ViewSet para listar y detallar productos disponibles en el marketplace. """
    serializer_class = ProductListSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "description", "category__name"]
    ordering_fields = ["created_at", "price", "title"]
    ordering = ["-created_at"]

    def get_queryset(self):
        """Retorna productos disponibles, opcionalmente filtrados por
        ``category`` (ID), ``condition`` y ``transaction_type``.
        Los filtros se pueden combinar.
        """
        queryset = Products.objects.select_related(
            "category", "seller"
        ).filter(status="disponible")

        category_id = self.request.query_params.get("category")
        if category_id:
            queryset = queryset.filter(category_id=category_id)

        condition = self.request.query_params.get("condition")
        if condition:
            queryset = queryset.filter(condition=condition)

        transaction_type = self.request.query_params.get("transaction_type")
        if transaction_type:
            queryset = queryset.filter(transaction_type=transaction_type)

        return queryset