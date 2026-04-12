# from rest_framework import serializers
# from gamification.models.avatar import AvatarData#, DesignTemplate

# class AvatarDataSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = AvatarData
#         fields = ['avatarData']

#     def validate_avatarData(self, value):
#         template_id = value.get('template_id')
#         if template_id and not DesignTemplate.objects.filter(id=template_id).exists():
#             raise serializers.ValidationError("DesignTemplate does not exist.")
#         return value

# class DesignTemplateSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = DesignTemplate
#         # Explicitly list fields to control what the frontend sees
#         fields = ['id', 'name', 'price', 'bought', 'config_data']

#         # 'bought' should likely be read-only so users can't
#         # just 'POST' a true value to get it for free.
#         read_only_fields = ['bought']

#     def validate_price(self, value):
#         """Ensure no one tries to set a negative price."""
#         if value < 0:
#             raise serializers.ValidationError("Price cannot be negative.")
#         return value

#     def validate_config_data(self, value):
#         """
#         Enforce the structure of your avatarData.
#         Ensures keys like 'borderColor' or 'zoom' exist.
#         """
#         required_keys = ['borderColor', 'borderWidth', 'zoom']
#         for key in required_keys:
#             if key not in value:
#                 raise serializers.ValidationError(f"Missing required config key: {key}")
#         return value
