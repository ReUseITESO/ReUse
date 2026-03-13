from rest_framework import serializers

from social.models import CommunityMember, CommunityPost


class CommunityPostListSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source="user.get_full_name", read_only=True)

    class Meta:
        model = CommunityPost
        fields = [
            "id", "community", "user", "author_name",
            "title", "content", "image_url", "is_pinned",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "user", "created_at", "updated_at"]


class CommunityPostDetailSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source="user.get_full_name", read_only=True)

    class Meta:
        model = CommunityPost
        fields = [
            "id", "community", "user", "author_name",
            "title", "content", "image_url", "is_pinned",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "user", "created_at", "updated_at"]


class CommunityPostWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommunityPost
        fields = ["id", "community", "title", "content", "image_url", "is_pinned"]
        read_only_fields = ["id"]

    def validate(self, attrs):
        request = self.context["request"]
        community = attrs.get("community") or (self.instance.community if self.instance else None)
        if not CommunityMember.objects.filter(community=community, user=request.user).exists():
            raise serializers.ValidationError(
                "Only community members can create or edit posts."
            )
        return attrs