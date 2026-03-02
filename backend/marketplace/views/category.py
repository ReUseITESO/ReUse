from rest_framework import viewsets
from drf_spectacular.utils import extend_schema, extend_schema_view

from marketplace.models import Category
from marketplace.serializers import CategorySerializer


@extend_schema_view(
    list=extend_schema(
        summary="List all categories",
        description="Returns a list of all product categories available in the marketplace.",
        tags=["Marketplace > Categories"],
    ),
    retrieve=extend_schema(
        summary="Retrieve a category",
        description="Returns the detail of a single category by its ID.",
        tags=["Marketplace > Categories"],
    ),
)
class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for listing and retrieving marketplace categories."""

    serializer_class = CategorySerializer
    queryset = Category.objects.all()
