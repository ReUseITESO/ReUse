from rest_framework import filters, mixins, status, viewsets
from rest_framework.response import Response

from marketplace.models import Products
from marketplace.serializers import ProductCreateSerializer, ProductListSerializer


class ProductViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin,
    viewsets.GenericViewSet,
):
    """ViewSet para listar, ver detalle y crear productos."""

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "description", "category__name"]
    ordering_fields = ["created_at", "price", "title"]
    ordering = ["-created_at"]

    def get_serializer_class(self):
        if self.action == "create":
            return ProductCreateSerializer
        return ProductListSerializer

    def get_queryset(self):
        queryset = Products.objects.select_related("category", "seller")

        if self.action in ("list", "retrieve"):
            queryset = queryset.filter(status="disponible")

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

    def create(self, request, *args, **kwargs):
        mock_user = getattr(request, "mock_user", None)
        if mock_user is None:
            return Response(
                {"error": {
                    "code": "AUTHENTICATION_ERROR",
                    "message": "Debes iniciar sesión para publicar un producto.",
                    "details": {},
                }},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(seller=mock_user)

        response_serializer = ProductListSerializer(
            serializer.instance,
            context=self.get_serializer_context(),
        )
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
