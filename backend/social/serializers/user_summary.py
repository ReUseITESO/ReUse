from rest_framework import serializers

from core.models import User


class SocialUserSummarySerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "profile_picture",
        ]

    def get_full_name(self, obj: User) -> str:
        return obj.get_full_name()

    # HU-CORE-17: ocultar datos personales de usuarios desactivados
    def to_representation(self, instance):
        data = super().to_representation(instance)
        if getattr(instance, "is_deactivated", False):
            data["first_name"] = "Usuario"
            data["last_name"] = "Desactivado"
            data["full_name"] = "Usuario Desactivado"
            data["email"] = ""
            data["profile_picture"] = None
        return data
