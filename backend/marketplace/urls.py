from django.urls import include, path
from rest_framework.routers import DefaultRouter

from marketplace.views import CategoryViewSet, ProductViewSet, TransactionViewSet

router = DefaultRouter()
router.register("products", ProductViewSet, basename="products")
router.register("categories", CategoryViewSet, basename="categories")
# /api/transactions/ -> TransactionViewSet
router.register("transactions", TransactionViewSet, basename="transactions")

urlpatterns = [
    path("", include(router.urls)),
]
