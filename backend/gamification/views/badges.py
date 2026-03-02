from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from gamification.models.badges import Badges
from gamification.models.user_badges import UserBadges
from gamification.serializers.badges import BadgeWithStatusSerializer

class UserBadgesStatusView(APIView):
    """
    Retrieves all system badges and annotates them with the user's earned status.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        all_badges = Badges.objects.all()
        user_badges = UserBadges.objects.filter(user=user).select_related('badges')
        earned_dict = {ub.badges.id: ub.earned_at for ub in user_badges}

        # Pass the earned_dict to the serializer via context
        serializer = BadgeWithStatusSerializer(
            all_badges, 
            many=True, 
            context={'earned_dict': earned_dict}
        )
        return Response(serializer.data)