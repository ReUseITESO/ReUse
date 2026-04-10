from django.utils import timezone
from rest_framework import serializers

from gamification.models import Challenge, UserChallenge


class ChallengeSerializer(serializers.ModelSerializer):
    joined = serializers.SerializerMethodField()

    class Meta:
        model = Challenge
        fields = [
            "id",
            "title",
            "description",
            "challenge_type",
            "goal",
            "bonus_points",
            "start_date",
            "end_date",
            "joined",
        ]

    def get_joined(self, obj):
        joined_challenge_ids = self.context.get("joined_challenge_ids", set())
        return obj.id in joined_challenge_ids


class UserChallengeSerializer(serializers.ModelSerializer):
    challenge_id = serializers.IntegerField(source="challenge.id", read_only=True)
    title = serializers.CharField(source="challenge.title", read_only=True)
    description = serializers.CharField(source="challenge.description", read_only=True)
    challenge_type = serializers.CharField(
        source="challenge.challenge_type", read_only=True
    )
    goal = serializers.IntegerField(source="challenge.goal", read_only=True)
    bonus_points = serializers.IntegerField(
        source="challenge.bonus_points", read_only=True
    )
    start_date = serializers.DateTimeField(
        source="challenge.start_date", read_only=True
    )
    end_date = serializers.DateTimeField(source="challenge.end_date", read_only=True)
    is_expired = serializers.SerializerMethodField()

    class Meta:
        model = UserChallenge
        fields = [
            "id",
            "challenge_id",
            "title",
            "description",
            "challenge_type",
            "goal",
            "progress",
            "bonus_points",
            "is_completed",
            "reward_claimed",
            "reward_claimed_at",
            "joined_at",
            "completed_at",
            "start_date",
            "end_date",
            "is_expired",
        ]

    def get_is_expired(self, obj):
        return obj.challenge.end_date < timezone.now()
