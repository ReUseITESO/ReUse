from rest_framework import serializers

from gamification.models.point_rule import PointAction


class AwardPointsSerializer(serializers.Serializer):
    user_id = serializers.IntegerField(required=False)
    action = serializers.ChoiceField(choices=PointAction.choices)
    reference_id = serializers.IntegerField(required=False)
