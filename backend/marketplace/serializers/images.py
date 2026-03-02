from rest_framework import serializers

from marketplace.models import Images


class ImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Images
        fields = ["id", "image_url", "order_number"]
