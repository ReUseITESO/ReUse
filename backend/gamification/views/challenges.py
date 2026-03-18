from django.utils import timezone
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from gamification.models import Challenge, UserChallenge
from gamification.serializers.challenges import (
    ChallengeSerializer,
    UserChallengeSerializer,
)
from gamification.services.challenge_service import (
    join_challenge,
    refresh_user_challenge_progress,
)


class ChallengeListView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={200: ChallengeSerializer(many=True)},
        description="List all active challenges available in the current time window.",
    )
    def get(self, request):
        now = timezone.now()
        challenges = Challenge.objects.filter(
            is_active=True,
            start_date__lte=now,
            end_date__gte=now,
        ).order_by("end_date", "id")

        joined_ids = set(
            UserChallenge.objects.filter(
                user=request.user,
                challenge_id__in=challenges.values_list("id", flat=True),
            ).values_list("challenge_id", flat=True)
        )
        serializer = ChallengeSerializer(
            challenges,
            many=True,
            context={"joined_challenge_ids": joined_ids},
        )
        return Response(serializer.data)


class JoinChallengeView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={201: UserChallengeSerializer},
        description="Join an active challenge and initialize user progress.",
    )
    def post(self, request, challenge_id):
        challenge = Challenge.objects.filter(id=challenge_id).first()
        if challenge is None:
            return Response(
                {"detail": "Challenge not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        user_challenge = join_challenge(user=request.user, challenge=challenge)
        serializer = UserChallengeSerializer(user_challenge)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class MyChallengesView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={200: UserChallengeSerializer(many=True)},
        description="List current user joined challenges with refreshed progress.",
    )
    def get(self, request):
        user_challenges = list(
            UserChallenge.objects.select_related("challenge").filter(user=request.user)
        )
        refreshed = [refresh_user_challenge_progress(item) for item in user_challenges]
        serializer = UserChallengeSerializer(refreshed, many=True)
        return Response(serializer.data)
