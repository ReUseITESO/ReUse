from rest_framework import filters, viewsets
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter
from drf_spectacular.types import OpenApiTypes

from marketplace.models import Products
from marketplace.serializers import ProductListSerializer


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
)
class ProductViewSet(viewsets.ReadOnlyModelViewSet):
"""ViewSet for listing and retrieving available marketplace products."""

ordering = ["-created_at"]

def get_queryset(self):
    """Returns available products, optionally filtered by
    ``category`` (ID), ``condition`` and ``transaction_type``.
    Filters can be combined.
    """
queryset = Products.objects.select_related(
"category", "seller"
).filter(status="disponible")
