from rest_framework import serializers

from social.models import Community, CommunityMember
from social.serializers.user_summary import SocialUserSummarySerializer


class CommunityMemberSerializer(serializers.ModelSerializer):
    user = SocialUserSummarySerializer(read_only=True)

    class Meta:
        model = CommunityMember
        fields = ["id", "user", "role", "joined_at"]


class CommunityListSerializer(serializers.ModelSerializer):
    creator = SocialUserSummarySerializer(read_only=True)
    members_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Community
        fields = [
            "id",
            "name",
            "description",
            "icon",
            "is_private",
            "is_active",
            "creator",
            "members_count",
            "created_at",
            "updated_at",
        ]


class CommunityDetailSerializer(serializers.ModelSerializer):
    creator = SocialUserSummarySerializer(read_only=True)
    members = serializers.SerializerMethodField()
    members_count = serializers.SerializerMethodField()

    class Meta:
        model = Community
        fields = [
            "id",
            "name",
            "description",
            "icon",
            "is_private",
            "is_active",
            "creator",
            "members_count",
            "members",
            "created_at",
            "updated_at",
        ]

    def get_members(self, obj: Community):
        # HU-CORE-17: excluir miembros con cuenta desactivada
        memberships = (
            obj.memberships.select_related("user")
            .filter(user__is_deactivated=False)
            .order_by("joined_at")
        )
        return CommunityMemberSerializer(memberships, many=True).data

    def get_members_count(self, obj: Community) -> int:
        # HU-CORE-17: excluir miembros con cuenta desactivada (consistente con get_members)
        return obj.memberships.filter(user__is_deactivated=False).count()


class CommunityCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Community
        fields = ["id", "name", "description", "icon", "is_private"]
        read_only_fields = ["id"]


class CommunityUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Community
        fields = ["name", "description", "icon", "is_private", "is_active"]
