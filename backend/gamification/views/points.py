# from rest_framework imports
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.models import User


class CurrentUserPointsView(APIView):
    """Get points for the currently authenticated user"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Primary source: authenticated user from JWT/session.
        # Fallback keeps compatibility with mock middleware during local demos.
        user = request.user if getattr(request, 'user', None) and request.user.is_authenticated else getattr(request, 'mock_user', None)
        if not user:
            return Response(
                {"detail": "Authentication required."},
                status=status.HTTP_401_UNAUTHORIZED
            )
        return Response({
            "points": user.points
        })


class UserPointsView(APIView):
    """Get points for a user by user_id"""
    def get(self, request, user_id):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response({
            "points": user.points
        })
