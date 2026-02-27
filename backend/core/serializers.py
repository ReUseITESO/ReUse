import re

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

User = get_user_model()


class SignUpSerializer(serializers.ModelSerializer):
    """Serializer para registro de nuevos usuarios ITESO."""

    password = serializers.CharField(
        write_only=True,
        min_length=8,
        validators=[validate_password],
        style={"input_type": "password"},
    )
    password_confirm = serializers.CharField(
        write_only=True,
        style={"input_type": "password"},
    )

    class Meta:
        model = User
        fields = [
            "email",
            "first_name",
            "last_name",
            "phone",
            "password",
            "password_confirm",
        ]
        extra_kwargs = {
            "first_name": {"required": True, "min_length": 2},
            "last_name": {"required": True, "min_length": 2},
        }

    def validate_email(self, value: str) -> str:
        value = value.lower().strip()
        if not re.match(r"^[^@]+@iteso\.mx$", value):
            raise serializers.ValidationError(
                "Solo se permiten correos del dominio @iteso.mx"
            )
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "Ya existe una cuenta registrada con este correo."
            )
        return value

    def validate(self, attrs: dict) -> dict:
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError(
                {"password_confirm": "Las contraseñas no coinciden."}
            )
        return attrs

    def create(self, validated_data: dict) -> User:
        validated_data.pop("password_confirm")
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class SignInSerializer(serializers.Serializer):
    """Serializer para inicio de sesión."""

    email = serializers.EmailField()
    password = serializers.CharField(
        write_only=True, style={"input_type": "password"}
    )


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer público del perfil de usuario."""

    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "full_name",
            "phone",
            "points",
            "profile_picture",
            "date_joined",
            "last_login",
        ]
        read_only_fields = ["id", "email", "points", "date_joined", "last_login"]

    def get_full_name(self, obj: User) -> str:
        return obj.get_full_name()
