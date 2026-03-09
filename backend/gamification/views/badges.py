from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from gamification.models.badges import Badges
from gamification.models.user_badges import UserBadges
from gamification.serializers.badges import BadgeWithStatusSerializer


class UserBadgesStatusView(APIView):
    """
    Retrieves all system badges and annotates them with the user's earned status.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        user = request.user

        if not user or not user.is_authenticated:
            return Response({"detail": "Las credenciales de autenticación no se proveyeron."}, status=401)

        all_badges = Badges.objects.all()
        user_badges = UserBadges.objects.filter(user=user).select_related('badges')

        # Diccionario para búsqueda rápida de fechas de obtención
        earned_dict = {ub.badges.id: ub.earned_at for ub in user_badges}

        serializer = BadgeWithStatusSerializer(
            all_badges,
            many=True,
            context={'earned_dict': earned_dict}
        )
        return Response(serializer.data)
