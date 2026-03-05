import html
import re

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

User = get_user_model()


def sanitize_string(value: str) -> str:
    value = re.sub(r"<[^>]*>", "", value)
    value = html.unescape(value)
    value = re.sub(r"<[^>]*>", "", value)
    value = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", value)
    return value.strip()


def sanitize_phone(value: str) -> str:
    cleaned = re.sub(r"[^\d+]", "", value)
    if cleaned.startswith("+"):
        cleaned = "+" + cleaned[1:].replace("+", "")
    return cleaned


class SignUpSerializer(serializers.ModelSerializer):

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
            "phone": {"required": True},
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

    def validate_first_name(self, value: str) -> str:
        value = sanitize_string(value)
        if not re.match(r"^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$", value):
            raise serializers.ValidationError(
                "El nombre solo puede contener letras y espacios."
            )
        if len(value) > 50:
            raise serializers.ValidationError(
                "El nombre no puede exceder 50 caracteres."
            )
        return value

    def validate_last_name(self, value: str) -> str:
        value = sanitize_string(value)
        if not re.match(r"^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$", value):
            raise serializers.ValidationError(
                "El apellido solo puede contener letras y espacios."
            )
        if len(value) > 50:
            raise serializers.ValidationError(
                "El apellido no puede exceder 50 caracteres."
            )
        return value

    def validate_phone(self, value: str) -> str:
        value = sanitize_phone(value)
        if not value:
            raise serializers.ValidationError(
                "El teléfono es obligatorio."
            )
        if not re.match(r"^\+?\d{10,15}$", value):
            raise serializers.ValidationError(
                "Ingresa un número válido (10-15 dígitos, puede iniciar con +)."
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
        validated_data["first_name"] = sanitize_string(validated_data["first_name"])
        validated_data["last_name"] = sanitize_string(validated_data["last_name"])
        validated_data["phone"] = sanitize_phone(validated_data.get("phone", ""))
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

    def validate_email(self, value: str) -> str:
        return sanitize_string(value).lower().strip()


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

    def validate_first_name(self, value: str) -> str:
        return sanitize_string(value)

    def validate_last_name(self, value: str) -> str:
        return sanitize_string(value)

    def validate_phone(self, value: str) -> str:
        return sanitize_phone(value) if value else value
