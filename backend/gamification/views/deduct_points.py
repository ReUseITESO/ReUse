from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.shortcuts import get_object_or_404

from drf_spectacular.utils import extend_schema

from core.models import User
from gamification.services.point_service import deduct_points
from gamification.serializers.deduct_points import DeductPointsSerializer


class DeductPointsView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        request=DeductPointsSerializer,
        responses={200: None},
        description="Deduct points from a user."
    )
    def post(self, request):

        serializer = DeductPointsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = get_object_or_404(User, id=serializer.validated_data["user_id"])

        deduct_points(
            user=user,
            points=serializer.validated_data["points"],
        )

        return Response(
            {"message": "Points deducted successfully"},
            status=status.HTTP_200_OK
        )