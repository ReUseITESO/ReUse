from rest_framework import serializers

from marketplace.models import Images
from marketplace.services.s3_service import get_presigned_url


class ImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Images
        fields = ["id", "image_url", "order_number"]

    def get_image_url(self, obj):
        return get_presigned_url(obj.image_url)
