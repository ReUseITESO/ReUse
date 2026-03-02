from rest_framework import serializers
from gamification.models.badges import Badges

class BadgeWithStatusSerializer(serializers.ModelSerializer):
    earned_at = serializers.SerializerMethodField()

    class Meta:
        model = Badges
        fields = ['id', 'name', 'description', 'icon_url', 'rarity', 'points', 'earned_at']

    def get_earned_at(self, obj):
        # Retrieve the dictionary passed from the view context
        earned_dict = self.context.get('earned_dict', {})
        return earned_dict.get(obj.id, None)