from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from gamification.services.impact_service import get_user_impact
from gamification.serializers.impact import ImpactSerializer


class UserImpactView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        data = get_user_impact(request.user)
        serializer = ImpactSerializer(data)
        return Response(serializer.data)