from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
# from rest_framework.decorators import action

# from rest_framework import status

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

from gamification.models.avatar import AvatarData
# from django.shortcuts import get_object_or_404
# from gamification.models.avatar import DesignTemplate
# from gamification.serializers.avatars import DesignTemplateSerializer

class AvatarDataView(APIView):
	# This automatically handles the "is_authenticated" check for you
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
        updated_data = {
            **DEFAULT_AVATAR_DATA, 
            **current_data, 
            **request.data
        }
        
        avatar.data = updated_data
        avatar.save()

        return Response(avatar.data)
    
# class AvatarDataView(APIView):
# 	permission_classes = [AllowAny]

# 	def get(self, request):
# 		user = request.user

# 		if not user.is_authenticated:
# 			return Response({"detail": "Not authenticated"}, status=401)
  
# 		try:
# 			avatar, created = AvatarData.objects.get_or_create(user=user)
# 			avatar_data = {
# 				"image": avatar.image,
# 				"border_color": avatar.border_color,
# 				"border_thickness": avatar.border_thickness,
# 				"zoom_level": avatar.zoom_level,
# 				"offset_x": avatar.offset_x,
# 				"offset_y": avatar.offset_y,
# 				"shadow_color": avatar.shadow_color,
# 				"shadow_thickness": avatar.shadow_thickness, 
# 				"border_type": avatar.border_type,
# 				"border_name": avatar.border_name,
# 			}
# 			return Response(avatar_data)
# 		except AvatarData.DoesNotExist:
# 			return Response({"detail": "Avatar no encontrado."}, status=404)

# 	def post(self, request):
# 		user = request.user

# 		if not user or not user.is_authenticated:
# 			return Response(
# 				{"detail": "Credentials failed to be provided"},
# 				status=401,
# 		)

# 		data = request.data
# 		avatar, created = AvatarData.objects.get_or_create(user=user)
# 		avatar.image = data.get("image", avatar.image)
# 		avatar.border_color = data.get("border_color", avatar.border_color)
# 		avatar.border_thickness = data.get("border_thickness", avatar.border_thickness)
# 		avatar.zoom_level = data.get("zoom_level", avatar.zoom_level)
# 		avatar.offset_x = data.get("offset_x", avatar.offset_x)
# 		avatar.offset_y = data.get("offset_y", avatar.offset_y)
# 		avatar.shadow_color = data.get("shadow_color", avatar.shadow_color)
# 		avatar.shadow_thickness = data.get("shadow_thickness", avatar.shadow_thickness)
# 		avatar.border_type = data.get("border_type", avatar.border_type)
# 		avatar.border_name = data.get("border_name", avatar.border_name)
# 		avatar.save()

# 		return Response({"detail": "Avatar updated succesfully"})


	# @action(detail=True, methods=['post'])
	# def select_template(self, request, pk=None):
	# 	profile = self.get_object()
	# 	template_id = request.data.get('template_id')
	# 	template = get_object_or_404(DesignTemplate, pk=template_id)

	# 	# Sync avatarData with template properties and store the key
	# 	profile.avatarData = {
	# 		**template.config_data, # Assuming DesignTemplate stores visual defaults
	# 		"template_id": template.id
	# 	}
	# 	profile.save()
	# 	return Response({"status": "template applied"})


# class DesignTemplateListCreate(APIView):
#     def get(self, request):
#         templates = DesignTemplate.objects.all()
#         serializer = DesignTemplateSerializer(templates, many=True)
#         return Response(serializer.data)

#     def post(self, request):
#         serializer = DesignTemplateSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=status.HTTP_201_CREATED)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# class DesignTemplateDetail(APIView):
#     def get(self, request, pk):
#         template = get_object_or_404(DesignTemplate, pk=pk)
#         serializer = DesignTemplateSerializer(template)
#         return Response(serializer.data)

#     def put(self, request, pk):
#         template = get_object_or_404(DesignTemplate, pk=pk)
#         serializer = DesignTemplateSerializer(template, data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data)
#         return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#     def delete(self, request, pk):
#         template = get_object_or_404(DesignTemplate, pk=pk)
#         template.delete()
#         return Response(status=status.HTTP_204_NO_CONTENT)
