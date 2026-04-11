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
    claim_challenge_reward,
    ensure_user_active_challenges,
    get_rotative_challenges,
    join_challenge,
    refresh_user_challenge_progress,
)


class ChallengeListView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={200: ChallengeSerializer(many=True)},
        description="List rotative active challenges that change daily/weekly/monthly.",
    )
    def get(self, request):
        now = timezone.now()
        ensure_user_active_challenges(user=request.user, now=now)
        # Get rotative challenges (3 daily, 3 weekly, 3 monthly)
        challenges = get_rotative_challenges(now)

        joined_ids = set(
            UserChallenge.objects.filter(
                user=request.user,
                challenge_id__in=[c.id for c in challenges],
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
        ensure_user_active_challenges(user=request.user, now=timezone.now())
        user_challenges = list(
            UserChallenge.objects.select_related("challenge").filter(user=request.user)
        )
        refreshed = [refresh_user_challenge_progress(item) for item in user_challenges]
        serializer = UserChallengeSerializer(refreshed, many=True)
        return Response(serializer.data)


class ClaimChallengeRewardView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={200: UserChallengeSerializer},
        description="Claim reward for a completed challenge once.",
    )
    def post(self, request, challenge_id):
        challenge = Challenge.objects.filter(id=challenge_id).first()
        if challenge is None:
            return Response(
                {"detail": "Challenge not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        claimed = claim_challenge_reward(user=request.user, challenge=challenge)
        serializer = UserChallengeSerializer(claimed)
        return Response(serializer.data, status=status.HTTP_200_OK)
