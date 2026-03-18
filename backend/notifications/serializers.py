from rest_framework import serializers

from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):

    notification_type_display = serializers.CharField(
        source="get_notification_type_display",
        read_only=True,
    )

    class Meta:
        model = Notification
        fields = [
            "id",
            "notification_type",
            "notification_type_display",
            "title",
            "message",
            "is_read",
            "related_object_id",
            "related_object_type",
            "action_url",
            "created_at",
            "read_at",
        ]
        read_only_fields = [
            "id",
            "notification_type",
            "notification_type_display",
            "title",
            "message",
            "related_object_id",
            "related_object_type",
            "action_url",
            "created_at",
            "read_at",
        ]


class NotificationMarkReadSerializer(serializers.Serializer):

    notification_ids = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        allow_empty=False,
    )


class UnreadCountSerializer(serializers.Serializer):

    unread_count = serializers.IntegerField(read_only=True)
