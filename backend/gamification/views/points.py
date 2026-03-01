# from rest_framework imports
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from core.models import User

class CurrentUserPointsView(APIView):
	"""Get points for the currently authenticated user"""
	
	def get(self, request):
		# Use mock_user from MockAuthMiddleware for development
		# TODO: Replace with request.user when JWT auth is implemented
		user = getattr(request, 'mock_user', None)
		if not user:
			return Response(
				{"detail": "Authentication required. Please provide X-Mock-User-Id header."},
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
