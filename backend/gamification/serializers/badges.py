from rest_framework import serializers
from gamification.models.badges import Badges

class BadgeWithStatusSerializer(serializers.ModelSerializer):
    earned_at = serializers.SerializerMethodField()

    class Meta:
        model = Badges
        fields = ['id', 'name', 'description', 'icon', 'points', 'rarity', 'earned_at']

    def get_earned_at(self, obj):
        earned_dict = self.context.get('earned_dict', {})
        return earned_dict.get(obj.id, None)