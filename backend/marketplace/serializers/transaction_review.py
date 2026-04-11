from rest_framework import serializers

from marketplace.models import TransactionReview


class TransactionReviewSerializer(serializers.ModelSerializer):
    reviewer_name = serializers.SerializerMethodField()

    def get_reviewer_name(self, obj):
        if getattr(obj.reviewer, "is_deactivated", False):
            return "Usuario Desactivado"
        return obj.reviewer.get_full_name()

    class Meta:
        model = TransactionReview
        fields = ["id", "rating", "comment", "reviewer_name", "created_at"]
        read_only_fields = ["id", "reviewer_name", "created_at"]


class TransactionReviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TransactionReview
        fields = ["rating", "comment"]

    def validate_rating(self, value):
        if not 1 <= value <= 5:
            raise serializers.ValidationError("La calificacion debe ser entre 1 y 5.")
        return value
