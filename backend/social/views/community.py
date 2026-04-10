from django.db.models import Count
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from social.models import Community
from social.permissions import IsCommunityAdminOrReadOnly
from social.serializers import (
    CommunityCreateSerializer,
    CommunityDetailSerializer,
    CommunityListSerializer,
    CommunityUpdateSerializer,
)
from social.services import (
    create_community_with_creator,
    join_community,
    leave_community,
    update_community,
)


@extend_schema_view(
    list=extend_schema(
        summary="List active communities", tags=["Social > Communities"]
    ),
    retrieve=extend_schema(
        summary="Retrieve a community", tags=["Social > Communities"]
    ),
    create=extend_schema(summary="Create a community", tags=["Social > Communities"]),
    partial_update=extend_schema(
        summary="Update a community", tags=["Social > Communities"]
    ),
)
class CommunityViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.CreateModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet,
):
    queryset = (
        Community.objects.select_related("creator")
        .prefetch_related("memberships__user")
        .annotate(members_count=Count("memberships"))
    )
    permission_classes = [IsAuthenticated, IsCommunityAdminOrReadOnly]

    def get_queryset(self):
        queryset = self.queryset.filter(is_active=True)
        visibility = self.request.query_params.get("visibility")
        if visibility == "private":
            return queryset.filter(is_private=True)
        if visibility == "public":
            return queryset.filter(is_private=False)
        return queryset

    def get_serializer_class(self):
        if self.action == "create":
            return CommunityCreateSerializer
        if self.action == "retrieve":
            return CommunityDetailSerializer
        if self.action == "partial_update":
            return CommunityUpdateSerializer
        return CommunityListSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        community = create_community_with_creator(
            creator=request.user,
            validated_data=serializer.validated_data,
        )
        response_serializer = CommunityDetailSerializer(community)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    def partial_update(self, request, *args, **kwargs):
        community = self.get_object()
        serializer = self.get_serializer(community, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        updated_community = update_community(
            community=community,
            validated_data=serializer.validated_data,
            user=request.user,
        )
        response_serializer = CommunityDetailSerializer(updated_community)
        return Response(response_serializer.data, status=status.HTTP_200_OK)

    @extend_schema(summary="Join a public community", tags=["Social > Communities"])
    @action(detail=True, methods=["post"], url_path="join", permission_classes=[IsAuthenticated])
    def join(self, request, pk=None):
        community = self.get_object()
        membership = join_community(community, request.user)
        return Response(
            {
                "message": "Community joined successfully.",
                "membership_id": membership.id,
            },
            status=status.HTTP_200_OK,
        )

    @extend_schema(summary="Leave a community", tags=["Social > Communities"])
    @action(detail=True, methods=["post"], url_path="leave", permission_classes=[IsAuthenticated])
    def leave(self, request, pk=None):
        community = self.get_object()
        leave_community(community, request.user)
        return Response(
            {"message": "Community left successfully."}, status=status.HTTP_200_OK
        )
