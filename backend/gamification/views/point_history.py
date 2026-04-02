from datetime import datetime, time

from django.utils.timezone import make_aware
from drf_spectacular.utils import OpenApiParameter, OpenApiTypes, extend_schema
from rest_framework import generics
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated

from gamification.models.point_transaction import PointTransaction
from gamification.serializers.point_history import PointHistorySerializer


class PointsHistoryView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PointHistorySerializer
    ordering_fields = ["created_at", "points", "action"]
    ordering = ["-created_at"]

    @extend_schema(
        summary="Get current user points history",
        description=(
            "Returns paginated points history for the authenticated user. "
            "Supports filters by action type and date range."
        ),
        tags=["Gamification > Points"],
        parameters=[
            OpenApiParameter(
                name="action",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description="Filter by action value (e.g. publish_item, points_deduction).",
            ),
            OpenApiParameter(
                name="start_date",
                type=OpenApiTypes.DATE,
                location=OpenApiParameter.QUERY,
                description="Filter transactions created at or after this date (YYYY-MM-DD).",
            ),
            OpenApiParameter(
                name="end_date",
                type=OpenApiTypes.DATE,
                location=OpenApiParameter.QUERY,
                description="Filter transactions created at or before this date (YYYY-MM-DD).",
            ),
            OpenApiParameter(
                name="ordering",
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description="Sort by created_at, points, or action. Prefix with '-' for descending.",
            ),
            OpenApiParameter(
                name="page",
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
                description="Page number.",
            ),
            OpenApiParameter(
                name="page_size",
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
                description="Results per page.",
            ),
        ],
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

    def get_queryset(self):
        user = self.request.user
        queryset = PointTransaction.objects.filter(user=user)

        action = self.request.query_params.get("action")
        if action:
            queryset = queryset.filter(action=action)

        start_date = self.request.query_params.get("start_date")
        end_date = self.request.query_params.get("end_date")

        if start_date:
            start_dt = _parse_date_boundary(start_date, is_end=False)
            queryset = queryset.filter(created_at__gte=start_dt)

        if end_date:
            end_dt = _parse_date_boundary(end_date, is_end=True)
            queryset = queryset.filter(created_at__lte=end_dt)

        return queryset


def _parse_date_boundary(value, *, is_end):
    try:
        parsed_date = datetime.strptime(value, "%Y-%m-%d").date()
    except ValueError as err:
        raise ValidationError(
            {"date": "Invalid date format. Use YYYY-MM-DD."}
        ) from err

    boundary_time = time.max if is_end else time.min
    return make_aware(datetime.combine(parsed_date, boundary_time))