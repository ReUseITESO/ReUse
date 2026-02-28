# from rest_framework imports
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from core.models import User

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
