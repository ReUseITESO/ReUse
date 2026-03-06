from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from core.models import User
from gamification.services.level_progression import build_level_progression


def _get_request_user(request):
	"""Resolve authenticated user supporting current JWT flow and legacy mock header."""
	request_user = getattr(request, "user", None)
	if request_user and getattr(request_user, "is_authenticated", False):
		return request_user
	return getattr(request, "mock_user", None)


class CurrentUserPointsView(APIView):
	"""Get points for the currently authenticated user."""

	@extend_schema(
		summary="Get current user points",
		description="Returns current authenticated user point balance.",
		tags=["Gamification > Points"],
	)
	def get(self, request):
		user = _get_request_user(request)
		if not user:
			return Response(
				{"detail": "Authentication required."},
				status=status.HTTP_401_UNAUTHORIZED,
			)
		return Response({"points": user.points})


class CurrentUserLevelProgressionView(APIView):
	"""Get level progression based on accumulated points for current user."""

	@extend_schema(
		summary="Get current user level progression",
		description=(
			"Returns current level, next level, progress percent, and points remaining "
			"to reach the next level for the authenticated user."
		),
		tags=["Gamification > Points"],
	)
	def get(self, request):
		user = _get_request_user(request)
		if not user:
			return Response(
				{"detail": "Authentication required."},
				status=status.HTTP_401_UNAUTHORIZED,
			)

		payload = build_level_progression(points=user.points)
		return Response(payload, status=status.HTTP_200_OK)


class UserPointsView(APIView):
	"""Get points for a user by user_id."""

	@extend_schema(
		summary="Get user points by id",
		description="Returns point balance for a specific user ID.",
		tags=["Gamification > Points"],
	)
	def get(self, request, user_id):
		try:
			user = User.objects.get(id=user_id)
		except User.DoesNotExist:
			return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)
		return Response({"points": user.points})
