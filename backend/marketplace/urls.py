from django.urls import include, path
from rest_framework.routers import DefaultRouter

from marketplace.views import (
    CategoryViewSet,
    CommentViewSet,
    CommunityMarketplaceViewSet,
    ProductViewSet,
    SwapTransactionViewSet,
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

swap_retrieve = SwapTransactionViewSet.as_view({"get": "retrieve_swap"})
swap_propose = SwapTransactionViewSet.as_view({"post": "propose"})
swap_respond_proposal = SwapTransactionViewSet.as_view({"patch": "respond_proposal"})
swap_propose_agenda = SwapTransactionViewSet.as_view({"patch": "propose_agenda"})
swap_respond_agenda = SwapTransactionViewSet.as_view({"patch": "respond_agenda"})

urlpatterns = [
    path("", include(router.urls)),
    path(
        "transactions/<int:pk>/swap/",
        swap_retrieve,
        name="swap-transactions-retrieve",
    ),
    path(
        "transactions/<int:pk>/swap/propose/",
        swap_propose,
        name="swap-transactions-propose",
    ),
    path(
        "transactions/<int:pk>/swap/respond-proposal/",
        swap_respond_proposal,
        name="swap-transactions-respond-proposal",
    ),
    path(
        "transactions/<int:pk>/swap/propose-agenda/",
        swap_propose_agenda,
        name="swap-transactions-propose-agenda",
    ),
    path(
        "transactions/<int:pk>/swap/respond-agenda/",
        swap_respond_agenda,
        name="swap-transactions-respond-agenda",
    ),
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
