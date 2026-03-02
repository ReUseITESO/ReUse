from django.db import transaction
from rest_framework import filters, mixins, status, viewsets
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter
from drf_spectacular.types import OpenApiTypes

from marketplace.models import Products
from marketplace.serializers import ProductCreateSerializer, ProductListSerializer
from marketplace.services import attach_images_to_product


@extend_schema_view(
    list=extend_schema(
        summary="List available products",
        description=(
            "Returns a paginated list of products with status **disponible**. <br>"
            "Supports filtering by category, condition, and transaction type via query params. <br>"
            "Results can be searched by **title**, **description**, or **category** name,"
            "and ordered by created_at, price, or title."
        ),
        parameters=[
            OpenApiParameter(
                name="category",
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
                description="Filter by category ID.",
                required=False,
            ),
            OpenApiParameter(
                name="condition",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description="Filter by product condition. Options: `nuevo`, `como_nuevo`, `buen_estado`, `usado`.",
                required=False,
                enum=["nuevo", "como_nuevo", "buen_estado", "usado"],
            ),
            OpenApiParameter(
                name="transaction_type",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description="Filter by transaction type. Options: `donation`, `sale`, `swap`.",
                required=False,
                enum=["donation", "sale", "swap"],
            ),
            OpenApiParameter(
                name="search",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description="Search products by title, description, or category name.",
                required=False,
            ),
            OpenApiParameter(
                name="ordering",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description="Order results. Options: `created_at`, `-created_at`, `price`, `-price`, `title`, `-title`.",
                required=False,
            ),
        ],
        tags=["Marketplace > Products"],
    ),
    retrieve=extend_schema(
        summary="Retrieve a product",
        description="Returns the full detail of a single product by its ID.",
        tags=["Marketplace > Products"],
    ),
    create=extend_schema(
        summary="Publish a product",
        description=(
            "Creates a new product listing for the authenticated user. <br>"
            "Accepts `multipart/form-data`. Include `images` (up to 5 files: JPEG, PNG or WebP). <br>"
            "Requires the `X-Mock-User-Id` header until real auth is implemented."
        ),
        tags=["Marketplace > Products"],
    ),
)
class ProductViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin,
    viewsets.GenericViewSet,
):
    """ViewSet for listing, retrieving, and creating marketplace products."""

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "description", "category__name"]
    ordering_fields = ["created_at", "price", "title"]
    ordering = ["-created_at"]

    def get_serializer_class(self):
        if self.action == "create":
            return ProductCreateSerializer
        return ProductListSerializer

    def get_queryset(self):
        queryset = Products.objects.select_related("category", "seller").prefetch_related("images")

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

        with transaction.atomic():
            serializer.save(seller=mock_user)
            images = request.FILES.getlist("images")
            if images:
                attach_images_to_product(serializer.instance, images)

        response_serializer = ProductListSerializer(
            serializer.instance,
            context=self.get_serializer_context(),
        )
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
