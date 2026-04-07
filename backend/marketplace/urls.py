from django.urls import include, path
from rest_framework.routers import DefaultRouter

from marketplace.views import CategoryViewSet, ProductViewSet, TransactionViewSet

# Crear el router y registrar los ViewSets ( los Endpoints de la API )
router = DefaultRouter()
# /api/products/ -> ProductViewSet
router.register("products", ProductViewSet, basename="products")
# /api/categories/ -> CategoryViewSet
router.register("categories", CategoryViewSet, basename="categories")
# /api/transactions/ -> TransactionViewSet
router.register("transactions", TransactionViewSet, basename="transactions")

urlpatterns = [
    path("", include(router.urls)),
]
