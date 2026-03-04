from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from drf_spectacular.utils import extend_schema

from core.models import User
from gamification.models.point_transaction import PointTransaction
from gamification.serializers.deduct_points import DeductPointsSerializer


class DeductPointsView(APIView):

    @extend_schema(
        request=DeductPointsSerializer,
        responses={200: None},
        description="Deduct points from a user."
    )
    def post(self, request):

        serializer = DeductPointsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = get_object_or_404(User, id=serializer.validated_data["user_id"])
        points = serializer.validated_data["points"]

        if user.points < points:
            return Response(
                {"error": "User does not have enough points"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.points -= points
        user.save(update_fields=["points"])

        PointTransaction.objects.create(
            user=user,
            action="points_deduction",
            points=-points,
            reference_id=None
        )

        return Response(
            {"message": "Points deducted successfully"},
            status=status.HTTP_200_OK
        )