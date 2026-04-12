from rest_framework import serializers

from marketplace.models import Report


class ReportCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = ["reason", "description"]

    def validate_description(self, value):
        if value and len(value.strip()) == 0:
            return None
        return value
