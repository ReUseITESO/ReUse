from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiParameter, extend_schema, extend_schema_view
from rest_framework import filters, mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from marketplace.models import Products
from marketplace.serializers import (
    ProductCreateSerializer,
    ProductDetailSerializer,
    ProductListSerializer,
    ProductStatusSerializer,
    ProductUpdateSerializer,
)
from marketplace.services import (
    change_product_status,
    delete_product,
    update_product,
)


@extend_schema_view(
    list=extend_schema(
        summary="List available products",
        description=(
            "Returns a paginated list of products with status **disponible**. <br>"
            "Supports filtering by category, condition, and transaction type via query params. <br>"
            "Results can be searched by **title**, **description**, or **category** name,"
            "and ordered by created_at, price, or title. <br><br>"
            "Use `?seller=me` to list all products "
            "owned by the authenticated user (any status). Requires JWT authentication."
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
            OpenApiParameter(
                name="seller",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description="Use `me` to list the authenticated user's own products (all statuses).",
                required=False,
                enum=["me"],
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
            "Requires JWT authentication."
        ),
        tags=["Marketplace > Products"],
    ),
    partial_update=extend_schema(
        summary="Update a product",
        description=(
            "Partially updates a product owned by the authenticated user. <br>"
            "Only products with status **disponible** can be edited. <br>"
            "Requires JWT authentication."
        ),
        tags=["Marketplace > Products"],
    ),
    destroy=extend_schema(
        summary="Delete a product",
        description=(
            "Permanently deletes a product owned by the authenticated user. <br>"
            "Only products with status **disponible** can be deleted. <br>"
            "Requires JWT authentication."
        ),
        tags=["Marketplace > Products"],
    ),
)
class ProductViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    """ViewSet for marketplace products CRUD operations."""

    http_method_names = ["get", "post", "patch", "delete", "head", "options"]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["title", "description", "category__name"]
    ordering_fields = ["created_at", "price", "title"]
    ordering = ["-created_at"]

    def get_serializer_class(self):
        if self.action == "create":
            return ProductCreateSerializer
        if self.action == "retrieve":
            return ProductDetailSerializer
        if self.action == "partial_update":
            return ProductUpdateSerializer
        if self.action == "change_status":
            return ProductStatusSerializer
        return ProductListSerializer

    def get_queryset(self):
        queryset = Products.objects.select_related(
            "category", "seller", "transaction"
        ).prefetch_related("images")

        seller_param = self.request.query_params.get("seller")
        is_my_products = seller_param == "me"

        if self.action in ("list", "retrieve"):
            if is_my_products:
                if self.request.user.is_authenticated:
                    queryset = queryset.filter(seller=self.request.user)
                else:
                    return Products.objects.none()
            else:
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
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(seller=request.user)

        response_serializer = ProductListSerializer(
            serializer.instance,
            context=self.get_serializer_context(),
        )

        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    def partial_update(self, request, *args, **kwargs):
        product = self.get_object()
        serializer = self.get_serializer(product, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        updated_product = update_product(
            product, serializer.validated_data, request.user
        )

        response_serializer = ProductListSerializer(
            updated_product,
            context=self.get_serializer_context(),
        )
        return Response(response_serializer.data, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        product = self.get_object()
        delete_product(product, request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @extend_schema(
        summary="Change product status",
        description=(
            "Changes the status of a product owned by the authenticated user. <br>"
            "Valid transitions: `disponible` → `en_proceso` | `pausado` | `cancelado`, "
            "`pausado` → `disponible` | `cancelado`, "
            "`en_proceso` → `disponible` | `completado` | `cancelado`. <br>"
            "A product cannot be paused when it has an active transaction (`pendiente` or `confirmada`). <br>"
            "Requires JWT authentication."
        ),
        request=ProductStatusSerializer,
        responses={200: ProductListSerializer},
        tags=["Marketplace > Products"],
    )
    @action(detail=True, methods=["patch"], url_path="status")
    def change_status(self, request, pk=None):
        product = self.get_object()
        product.refresh_from_db()
        serializer = ProductStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        updated_product = change_product_status(
            product, serializer.validated_data["status"], request.user
        )

        response_serializer = ProductListSerializer(
            updated_product,
            context=self.get_serializer_context(),
        )
        return Response(response_serializer.data, status=status.HTTP_200_OK)
