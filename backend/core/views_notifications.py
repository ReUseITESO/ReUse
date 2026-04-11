from django.utils import timezone
from rest_framework import serializers, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.models.notification import Notification


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            "id",
            "type",
            "title",
            "body",
            "reference_id",
            "is_read",
            "read_at",
            "created_at",
        ]
        read_only_fields = fields


class NotificationListView(APIView):
    """GET /api/core/notifications/ — list notifications paginated, newest first."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        page = int(request.query_params.get("page", 1))
        page_size = 20
        offset = (page - 1) * page_size

        qs = Notification.objects.filter(user=request.user).order_by("-created_at")
        total = qs.count()
        notifications = qs[offset : offset + page_size]

        base_url = request.build_absolute_uri(request.path)
        next_url = f"{base_url}?page={page + 1}" if offset + page_size < total else None
        prev_url = f"{base_url}?page={page - 1}" if page > 1 else None

        return Response(
            {
                "count": total,
                "next": next_url,
                "previous": prev_url,
                "results": NotificationSerializer(notifications, many=True).data,
            }
        )


class NotificationCountView(APIView):
    """GET /api/core/notifications/count/ — unread count."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        count = Notification.objects.filter(user=request.user, is_read=False).count()
        return Response({"unread_count": count})


class NotificationMarkReadView(APIView):
    """PATCH /api/core/notifications/{id}/read/ — mark single as read."""

    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            notification = Notification.objects.get(pk=pk, user=request.user)
        except Notification.DoesNotExist:
            return Response(
                {
                    "error": {
                        "code": "NOT_FOUND",
                        "message": "Notificación no encontrada.",
                    }
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        if not notification.is_read:
            notification.is_read = True
            notification.read_at = timezone.now()
            notification.save(update_fields=["is_read", "read_at"])

        return Response(NotificationSerializer(notification).data)


class NotificationMarkAllReadView(APIView):
    """POST /api/core/notifications/read-all/ — mark all as read."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        Notification.objects.filter(user=request.user, is_read=False).update(
            is_read=True,
            read_at=timezone.now(),
        )
        return Response({"message": "Todas las notificaciones marcadas como leídas."})
