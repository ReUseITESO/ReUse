from rest_framework import serializers

from marketplace.serializers.product import ProductListSerializer


class GamificationSummarySerializer(serializers.Serializer):
    """Placeholder for gamification data until module is implemented."""
    points = serializers.IntegerField()
    badges_count = serializers.IntegerField()


class DashboardSerializer(serializers.Serializer):
    """Aggregated dashboard response for the home page."""
    recent_products = ProductListSerializer(many=True, read_only=True)
    user_products = ProductListSerializer(many=True, read_only=True)
    user_products_count = serializers.IntegerField()
    active_transactions_count = serializers.IntegerField()
    gamification = GamificationSummarySerializer()
