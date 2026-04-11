from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from gamification.models.avatar import Avatar

class AvatarView(APIView):
	permission_classes = [AllowAny]

	def get(self, request):
		user = request.user

		if not user.is_authenticated:
			return Response({"detail": "Not authenticated"}, status=401)
  
		try:
			avatar, created = Avatar.objects.get_or_create(user=user)
			avatar_data = {
				"image": avatar.image,
				"border_color": avatar.border_color,
				"border_thickness": avatar.border_thickness,
				"zoom_level": avatar.zoom_level,
				"offset_x": avatar.offset_x,
				"offset_y": avatar.offset_y,
				"shadow_color": avatar.shadow_color,
				"shadow_thickness": avatar.shadow_thickness, 
				"border_type": avatar.border_type,
				"border_name": avatar.border_name,
			}
			return Response(avatar_data)
		except Avatar.DoesNotExist:
			return Response({"detail": "Avatar no encontrado."}, status=404)

	def post(self, request):
		user = request.user

		if not user or not user.is_authenticated:
			return Response(
				{"detail": "Credentials failed to be provided"},
				status=401,
			)

		data = request.data
		avatar, created = Avatar.objects.get_or_create(user=user)
		avatar.image = data.get("image", avatar.image)
		avatar.border_color = data.get("border_color", avatar.border_color)
		avatar.border_thickness = data.get("border_thickness", avatar.border_thickness)
		avatar.zoom_level = data.get("zoom_level", avatar.zoom_level)
		avatar.offset_x = data.get("offset_x", avatar.offset_x)
		avatar.offset_y = data.get("offset_y", avatar.offset_y)
		avatar.shadow_color = data.get("shadow_color", avatar.shadow_color)
		avatar.shadow_thickness = data.get("shadow_thickness", avatar.shadow_thickness)
		avatar.border_type = data.get("border_type", avatar.border_type)
		avatar.border_name = data.get("border_name", avatar.border_name)
		avatar.save()

		return Response({"detail": "Avatar updated succesfully"})
