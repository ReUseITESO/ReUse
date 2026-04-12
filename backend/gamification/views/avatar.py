from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from gamification.models.avatar import AvatarData

# Constants
DEFAULT_AVATAR_DATA = {
    "image": "'/../media/avatars/default.png",
    "border_color": "#00264C",
    "border_thickness": 10,
    "zoom_level": 1.0,
    "offset_x": 0.0,
    "offset_y": 0.0,
    "shadow_color": "#4200B5",
    "shadow_thickness": 20,
    "border_type": "custom",
    "border_name": None,
    "template_id": None,
}


class AvatarDataView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # 1. Find the avatar row for this user
        avatar, _ = AvatarData.objects.get_or_create(user=request.user)

        # 2. Return the JSON object stored in the database
        # This returns everything: image, colors, and your new template_id
        response_data = {**DEFAULT_AVATAR_DATA, **(avatar.data or {})}
        return Response(response_data)

    def post(self, request):
        # 1. Find the avatar row
        avatar, _ = AvatarData.objects.get_or_create(user=request.user)

        current_data = avatar.data if isinstance(avatar.data, dict) else {}

        # Three-way merge: Defaults <- Current Data <- New Request Data
        updated_data = {**DEFAULT_AVATAR_DATA, **current_data, **request.data}

        avatar.data = updated_data
        avatar.save()

        return Response(avatar.data)
