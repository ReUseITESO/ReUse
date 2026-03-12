from django.db.models import Q
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from social.models import UserConnection
from social.serializers import (
    UserConnectionCreateSerializer,
    UserConnectionResponseSerializer,
    UserConnectionSerializer,
)
from social.services import create_connection_request, respond_to_connection


@extend_schema_view(
    list=extend_schema(summary="List my social connections", tags=["Social > Connections"]),
    create=extend_schema(summary="Send a connection request", tags=["Social > Connections"]),
)
class UserConnectionViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.RetrieveModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserConnection.objects.select_related("requester", "addressee").filter(
            Q(requester=self.request.user) | Q(addressee=self.request.user)
        )

    def get_serializer_class(self):
        if self.action == "create":
            return UserConnectionCreateSerializer
        if self.action == "respond":
            return UserConnectionResponseSerializer
        return UserConnectionSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        connection = create_connection_request(
            requester=request.user,
            addressee_id=serializer.validated_data["addressee_id"],
        )
        response_serializer = UserConnectionSerializer(connection)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    @extend_schema(summary="Respond to a connection request", tags=["Social > Connections"])
    @action(detail=True, methods=["patch"], url_path="respond")
    def respond(self, request, pk=None):
        connection = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        updated_connection = respond_to_connection(
            connection=connection,
            user=request.user,
            new_status=serializer.validated_data["status"],
        )
        response_serializer = UserConnectionSerializer(updated_connection)
        return Response(response_serializer.data, status=status.HTTP_200_OK)
