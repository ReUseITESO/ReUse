from django.urls import include, path
from rest_framework.routers import DefaultRouter

from marketplace.views import (
    CategoryViewSet,
    CommentViewSet,
    CommunityMarketplaceViewSet,
    ProductViewSet,
    TransactionViewSet,
)

router = DefaultRouter()
router.register("products", ProductViewSet, basename="products")
router.register(
    "community-products", CommunityMarketplaceViewSet, basename="community-products"
)
router.register("categories", CategoryViewSet, basename="categories")
router.register("transactions", TransactionViewSet, basename="transactions")

comment_list = CommentViewSet.as_view({"get": "list", "post": "create"})
comment_detail = CommentViewSet.as_view({"delete": "destroy"})

urlpatterns = [
    path("", include(router.urls)),
    path(
        "products/<int:product_pk>/comments/",
        comment_list,
        name="product-comments-list",
    ),
    path(
        "products/<int:product_pk>/comments/<int:pk>/",
        comment_detail,
        name="product-comments-detail",
    ),
]
