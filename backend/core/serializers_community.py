"""Serializers for the community module (HU-CORE-13)."""

from django.contrib.auth import get_user_model
from rest_framework import serializers

from core.models.community import (
    Community,
    CommunityInvitation,
    CommunityMembership,
    CommunityPost,
)

User = get_user_model()


class CommunityMemberSerializer(serializers.ModelSerializer):
    """Minimal user info for member lists."""

    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "profile_picture",
        ]
        read_only_fields = fields

    def get_full_name(self, obj):
        return obj.get_full_name()


class MembershipSerializer(serializers.ModelSerializer):
    user = CommunityMemberSerializer(read_only=True)

    class Meta:
        model = CommunityMembership
        fields = ["id", "user", "role", "joined_at"]
        read_only_fields = fields


class CommunityListSerializer(serializers.ModelSerializer):
    """Serializer for community list view."""

    created_by_name = serializers.CharField(
        source="created_by.get_full_name", read_only=True
    )
    member_count = serializers.SerializerMethodField()

    class Meta:
        model = Community
        fields = [
            "id",
            "name",
            "description",
            "image_url",
            "created_by_name",
            "member_count",
            "created_at",
        ]
        read_only_fields = fields

    def get_member_count(self, obj):
        return obj.memberships.count()


class CommunityDetailSerializer(serializers.ModelSerializer):
    """Serializer for community detail view."""

    created_by_name = serializers.CharField(
        source="created_by.get_full_name", read_only=True
    )
    member_count = serializers.SerializerMethodField()
    is_member = serializers.SerializerMethodField()
    user_role = serializers.SerializerMethodField()

    class Meta:
        model = Community
        fields = [
            "id",
            "name",
            "description",
            "image_url",
            "created_by",
            "created_by_name",
            "member_count",
            "is_member",
            "user_role",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields

    def get_member_count(self, obj):
        return obj.memberships.count()

    def get_is_member(self, obj):
        user = self.context.get("request", {})
        if hasattr(user, "user"):
            user = user.user
        if not user or not hasattr(user, "id"):
            return False
        return obj.memberships.filter(user=user).exists()

    def get_user_role(self, obj):
        user = self.context.get("request", {})
        if hasattr(user, "user"):
            user = user.user
        if not user or not hasattr(user, "id"):
            return None
        membership = obj.memberships.filter(user=user).first()
        return membership.role if membership else None


class CommunityCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Community
        fields = ["name", "description", "image_url"]

    def validate_name(self, value):
        value = value.strip()
        if len(value) < 3:
            raise serializers.ValidationError(
                "El nombre debe tener al menos 3 caracteres."
            )
        if len(value) > 100:
            raise serializers.ValidationError(
                "El nombre no puede exceder 100 caracteres."
            )
        return value


class CommunityPostSerializer(serializers.ModelSerializer):
    author = CommunityMemberSerializer(read_only=True)

    class Meta:
        model = CommunityPost
        fields = ["id", "author", "content", "created_at", "updated_at"]
        read_only_fields = ["id", "author", "created_at", "updated_at"]


class CommunityPostCreateSerializer(serializers.Serializer):
    content = serializers.CharField(min_length=1, max_length=2000)


class CommunityInvitationSerializer(serializers.ModelSerializer):
    invited_by = CommunityMemberSerializer(read_only=True)
    invited_user = CommunityMemberSerializer(read_only=True)
    community_name = serializers.CharField(source="community.name", read_only=True)

    class Meta:
        model = CommunityInvitation
        fields = [
            "id",
            "community",
            "community_name",
            "invited_by",
            "invited_user",
            "status",
            "created_at",
        ]
        read_only_fields = fields
