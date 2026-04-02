from rest_framework import serializers

from social.models import FrequentContact
from social.serializers.user_summary import SocialUserSummarySerializer


class FrequentContactSerializer(serializers.ModelSerializer):
    contact = SocialUserSummarySerializer(read_only=True)

    class Meta:
        model = FrequentContact
        fields = ["id", "contact", "created_at"]


class FrequentContactCreateSerializer(serializers.Serializer):
    contact_id = serializers.IntegerField(min_value=1)
