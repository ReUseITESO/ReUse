from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from drf_spectacular.utils import extend_schema

from core.models import User
from gamification.services.point_service import award_points
from gamification.serializers.award_points import AwardPointsSerializer


class AwardPointsView(APIView):

    @extend_schema(
        request=AwardPointsSerializer,
        responses={200: None},
        description="Award points to a user based on a specific action."
    )
    def post(self, request):

        serializer = AwardPointsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = get_object_or_404(User, id=serializer.validated_data["user_id"])

        award_points(
            user=user,
            action=serializer.validated_data["action"],
            reference_id=serializer.validated_data.get("reference_id"),
        )

        return Response(
            {"message": "Points awarded successfully"},
            status=status.HTTP_200_OK,
        )