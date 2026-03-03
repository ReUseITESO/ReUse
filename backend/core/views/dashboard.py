from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema

from marketplace.models import Products
from marketplace.serializers.product import ProductListSerializer
from core.serializers.dashboard import DashboardSerializer


class DashboardView(APIView):
    """Aggregated dashboard endpoint for the home page.

    Returns recent products, user listings, and placeholder data
    for transactions and gamification until those modules are ready.
    """

    @extend_schema(
        summary="Get home dashboard data",
        description=(
            "Returns an aggregated view for the home dashboard including "
            "recent products, user listings, active transactions count, "
            "and gamification summary. Requires X-Mock-User-Id header."
        ),
        responses={200: DashboardSerializer},
        tags=["Core > Dashboard"],
    )
    def get(self, request):
        mock_user = getattr(request, "mock_user", None)

        recent_products = (
            Products.objects
            .select_related("category", "seller")
            .filter(status="disponible")
            .order_by("-created_at")[:6]
        )

        user_products = []
        user_products_count = 0
        user_points = 0

        if mock_user:
            user_qs = (
                Products.objects
                .select_related("category", "seller")
                .filter(seller=mock_user)
                .order_by("-created_at")
            )
            user_products_count = user_qs.count()
            user_products = user_qs[:3]
            user_points = getattr(mock_user, "points", 0)

        data = {
            "recent_products": ProductListSerializer(
                recent_products, many=True
            ).data,
            "user_products": ProductListSerializer(
                user_products, many=True
            ).data,
            "user_products_count": user_products_count,
            "active_transactions_count": 0,
            "gamification": {
                "points": user_points,
                "badges_count": 0,
            },
        }

        return Response(data, status=status.HTTP_200_OK)
