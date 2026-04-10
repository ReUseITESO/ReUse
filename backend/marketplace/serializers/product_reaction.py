from rest_framework import serializers


class ProductReactionRequestSerializer(serializers.Serializer):
    """Serializer for validating reaction create/update payload."""

    type = serializers.ChoiceField(choices=["like", "dislike"])


class ProductReactionSummarySerializer(serializers.Serializer):
    """Serializer for returning reaction counters and current user state."""

    likes_count = serializers.IntegerField()
    dislikes_count = serializers.IntegerField()
    user_reaction = serializers.ChoiceField(
        choices=["like", "dislike"],
        allow_null=True,
    )
