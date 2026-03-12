from rest_framework import serializers

from core.models import User


class SocialUserSummarySerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "full_name", "profile_picture"]

    def get_full_name(self, obj: User) -> str:
        return obj.get_full_name()
