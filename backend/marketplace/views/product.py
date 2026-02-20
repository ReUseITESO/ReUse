from rest_framework import filters, viewsets

from marketplace.models import Products
from marketplace.serializers import ProductListSerializer


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    """ ViewSet para listar productos. """
    serializer_class = ProductListSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "description", "category__name"]
    ordering_fields = ["created_at", "price", "title"]
    ordering = ["-created_at"]

    def get_queryset(self):
        """ Metodo: Obtener queryset de productos disponibles"""

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