from rest_framework import serializers

from social.models import UserConnection
from social.serializers.user_summary import SocialUserSummarySerializer


class UserConnectionSerializer(serializers.ModelSerializer):
    requester = SocialUserSummarySerializer(read_only=True)
    addressee = SocialUserSummarySerializer(read_only=True)

    class Meta:
        model = UserConnection
        fields = [
            "id",
            "requester",
            "addressee",
            "status",
            "created_at",
            "updated_at",
        ]


class UserConnectionCreateSerializer(serializers.Serializer):
    addressee_id = serializers.IntegerField(min_value=1)


class UserConnectionResponseSerializer(serializers.Serializer):
    status = serializers.ChoiceField(
        choices=[
            UserConnection.Status.ACCEPTED,
            UserConnection.Status.REJECTED,
            UserConnection.Status.BLOCKED,
        ]
    )
