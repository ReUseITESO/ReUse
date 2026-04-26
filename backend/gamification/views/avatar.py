from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

DEFAULT_AVATAR_DATA = {
    "image": "./media/avatars/default.png",
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
        """Get avatar data from user's avatar_data JSONField"""
        user = request.user
        current_data = user.avatar_data if isinstance(user.avatar_data, dict) else {}
        response_data = {**DEFAULT_AVATAR_DATA, **current_data}
        return Response(response_data)

    def post(self, request):
        """Update avatar data in user's avatar_data JSONField"""
        user = request.user
        current_data = user.avatar_data if isinstance(user.avatar_data, dict) else {}

        # Three-way merge: Defaults <- Current Data <- New Request Data
        updated_data = {**DEFAULT_AVATAR_DATA, **current_data, **request.data}

        user.avatar_data = updated_data
        user.save()

        return Response(user.avatar_data)
