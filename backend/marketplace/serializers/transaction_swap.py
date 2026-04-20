import re

from django.utils import timezone
from rest_framework import serializers


class SwapProposalSerializer(serializers.Serializer):
    proposed_product_id = serializers.IntegerField(min_value=1)


class SwapProposalDecisionSerializer(serializers.Serializer):
    accepted = serializers.BooleanField()


class SwapAgendaProposalSerializer(serializers.Serializer):
    delivery_location = serializers.CharField(max_length=255, trim_whitespace=True)
    delivery_date = serializers.DateTimeField()

    def validate_delivery_location(self, value):
        location_without_meeting = re.sub(
            r"\s*·\s*Reuni[oó]n\s+.+$",
            "",
            value,
            flags=re.IGNORECASE,
        ).strip()

        if not location_without_meeting:
            raise serializers.ValidationError("La ubicación de entrega es obligatoria.")

        return location_without_meeting

    def validate_delivery_date(self, value):
        if value <= timezone.now():
            raise serializers.ValidationError("La fecha de entrega debe ser futura.")
        return value


class SwapAgendaDecisionSerializer(serializers.Serializer):
    accepted = serializers.BooleanField()
