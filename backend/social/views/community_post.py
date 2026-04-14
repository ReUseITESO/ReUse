from rest_framework import permissions, viewsets

from social.models import CommunityPost
from social.serializers.community_post import (
    CommunityPostDetailSerializer,
    CommunityPostListSerializer,
    CommunityPostWriteSerializer,
)


class CommunityPostViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # HU-CORE-17: excluir posts de usuarios desactivados
        return (
            CommunityPost.objects.select_related("community", "user")
            .filter(community__memberships__user=self.request.user)
            .exclude(user__is_deactivated=True)
            .distinct()
        )

    def get_serializer_class(self):
        if self.action == "list":
            return CommunityPostListSerializer
        if self.action in ["create", "update", "partial_update"]:
            return CommunityPostWriteSerializer
        return CommunityPostDetailSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
