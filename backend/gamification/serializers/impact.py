from rest_framework import serializers


class ImpactSerializer(serializers.Serializer):
    items_reused = serializers.IntegerField()
    items_saved_from_waste = serializers.IntegerField()
    co2_avoided = serializers.FloatField()
    community_average_items = serializers.FloatField()
    community_average_co2 = serializers.FloatField()