from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import mixins, status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from social.models import FrequentContact
from social.serializers import (
    FrequentContactCreateSerializer,
    FrequentContactSerializer,
)
from social.services import create_frequent_contact, delete_frequent_contact


@extend_schema_view(
    list=extend_schema(
        summary="List my frequent contacts", tags=["Social > Frequent Contacts"]
    ),
    create=extend_schema(
        summary="Mark a frequent contact", tags=["Social > Frequent Contacts"]
    ),
    destroy=extend_schema(
        summary="Remove a frequent contact", tags=["Social > Frequent Contacts"]
    ),
)
class FrequentContactViewSet(
    mixins.ListModelMixin,
    mixins.CreateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return FrequentContact.objects.select_related("user", "contact").filter(
            user=self.request.user
        )

    def get_serializer_class(self):
        if self.action == "create":
            return FrequentContactCreateSerializer
        return FrequentContactSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        frequent_contact = create_frequent_contact(
            user=request.user,
            contact_id=serializer.validated_data["contact_id"],
        )
        response_serializer = FrequentContactSerializer(frequent_contact)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        frequent_contact = self.get_object()
        delete_frequent_contact(frequent_contact, request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)
