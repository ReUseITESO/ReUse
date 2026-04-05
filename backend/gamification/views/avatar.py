from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from gamification.models.avatar import Avatar

class AvatarView(APIView):
	permission_classes = [AllowAny]

	def get(self, request):
		user = request.user

		if not user or not user.is_authenticated:
			return Response(
				{"detail": "Las credenciales de autenticación no se proveyeron."},
				status=401,
			)

		try:
			avatar = Avatar.objects.get(user=user)
			avatar_data = {
				"image": avatar.image.url,
				"border_color": avatar.border_color,
				"border_thickness": avatar.border_thickness,
				"zoom_level": avatar.zoom_level,
				"offset_x": avatar.offset_x,
				"offset_y": avatar.offset_y,
				"shadow_color": avatar.shadow_color,
				"shadow_thickness": avatar.shadow_thickness,
			}
			return Response(avatar_data)
		except Avatar.DoesNotExist:
			return Response({"detail": "Avatar no encontrado."}, status=404)