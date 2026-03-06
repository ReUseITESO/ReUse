from rest_framework import serializers


class DeductPointsSerializer(serializers.Serializer):
    user_id = serializers.IntegerField(required=False)
    points = serializers.IntegerField(min_value=1)
    reason = serializers.CharField(required=False)