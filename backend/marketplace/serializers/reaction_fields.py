class ReactionSerializerFieldsMixin:
    """Reusable reaction fields and getters for product serializers."""

    def get_likes_count(self, obj):
        if hasattr(obj, "likes_count"):
            return obj.likes_count or 0
        return obj.reactions.filter(type="like").count()

    def get_dislikes_count(self, obj):
        if hasattr(obj, "dislikes_count"):
            return obj.dislikes_count or 0
        return obj.reactions.filter(type="dislike").count()

    def get_user_reaction(self, obj):
        if hasattr(obj, "user_reaction"):
            return obj.user_reaction

        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return None

        return (
            obj.reactions.filter(user=request.user)
            .values_list("type", flat=True)
            .first()
        )
