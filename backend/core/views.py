from django.contrib.auth import authenticate, get_user_model
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from .serializers import SignUpSerializer, SignInSerializer, UserProfileSerializer

User = get_user_model()


class SignUpView(generics.CreateAPIView):
    """
    POST /api/auth/signup/
    Registra un nuevo usuario ITESO y devuelve tokens JWT.
    """

    serializer_class = SignUpSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "message": "Cuenta creada exitosamente.",
                "user": UserProfileSerializer(user).data,
                "tokens": {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                },
            },
            status=status.HTTP_201_CREATED,
        )


class SignInView(APIView):
    """
    POST /api/auth/signin/
    Autentica al usuario con email y contraseña, devuelve tokens JWT.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = SignInSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"].lower().strip()
        password = serializer.validated_data["password"]

        user = authenticate(request, email=email, password=password)

        if user is None:
            return Response(
                {
                    "error": {
                        "code": "INVALID_CREDENTIALS",
                        "message": "Correo o contraseña incorrectos.",
                    }
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not user.is_active:
            return Response(
                {
                    "error": {
                        "code": "ACCOUNT_DISABLED",
                        "message": "Esta cuenta ha sido desactivada.",
                    }
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "message": "Sesión iniciada correctamente.",
                "user": UserProfileSerializer(user).data,
                "tokens": {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                },
            },
            status=status.HTTP_200_OK,
        )


class SignOutView(APIView):
    """
    POST /api/auth/signout/
    Invalida el refresh token (blacklist) para cerrar sesión.
    """

    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")

        if not refresh_token:
            return Response(
                {
                    "error": {
                        "code": "MISSING_TOKEN",
                        "message": "Se requiere el refresh token.",
                    }
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except TokenError:
            return Response(
                {
                    "error": {
                        "code": "INVALID_TOKEN",
                        "message": "Token inválido o ya expirado.",
                    }
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {"message": "Sesión cerrada correctamente."},
            status=status.HTTP_200_OK,
        )


class ProfileView(generics.RetrieveUpdateAPIView):
    """
    GET  /api/auth/profile/  – Obtener perfil del usuario autenticado.
    PATCH /api/auth/profile/ – Actualizar perfil del usuario autenticado.
    """

    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user
