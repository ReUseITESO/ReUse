from rest_framework import serializers

from social.models import CommunityMember, CommunityPost


class CommunityPostListSerializer(serializers.ModelSerializer):
    # HU-CORE-17: ocultar nombre real si el autor está desactivado
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = CommunityPost
        fields = [
            "id",
            "community",
            "user",
            "author_name",
            "title",
            "content",
            "image_url",
            "is_pinned",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "user", "created_at", "updated_at"]

    def get_author_name(self, obj) -> str:
        if getattr(obj.user, "is_deactivated", False):
            return "Usuario Desactivado"
        return obj.user.get_full_name()


class CommunityPostDetailSerializer(serializers.ModelSerializer):
    # HU-CORE-17: ocultar nombre real si el autor está desactivado
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = CommunityPost
        fields = [
            "id",
            "community",
            "user",
            "author_name",
            "title",
            "content",
            "image_url",
            "is_pinned",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "user", "created_at", "updated_at"]

    def get_author_name(self, obj) -> str:
        if getattr(obj.user, "is_deactivated", False):
            return "Usuario Desactivado"
        return obj.user.get_full_name()


class CommunityPostWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommunityPost
        fields = ["id", "community", "title", "content", "image_url", "is_pinned"]
        read_only_fields = ["id"]

    def validate(self, attrs):
        request = self.context["request"]
        community = attrs.get("community") or (
            self.instance.community if self.instance else None
        )
        if not CommunityMember.objects.filter(
            community=community, user=request.user
        ).exists():
            raise serializers.ValidationError(
                "Only community members can create or edit posts."
            )
        return attrs
