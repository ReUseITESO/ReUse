from django.db.models import Count, Q
from rest_framework.exceptions import ValidationError

from marketplace.models import ProductReaction

ALLOWED_REACTION_STATUSES = {"disponible", "en_proceso"}


def _validate_reaction_allowed(product, user):
    if product.status not in ALLOWED_REACTION_STATUSES:
        raise ValidationError(
            {
                "status": (
                    "Solo se puede reaccionar a productos con estado "
                    "disponible o en_proceso."
                )
            }
        )

    if product.seller_id == user.pk:
        raise ValidationError(
            {"non_field_errors": ["No puedes reaccionar a tu propio producto."]}
        )


def upsert_product_reaction(product, user, reaction_type):
    """Create/switch/toggle a product reaction for a user."""

    _validate_reaction_allowed(product, user)

    reaction = ProductReaction.objects.filter(product=product, user=user).first()

    if reaction and reaction.type == reaction_type:
        reaction.delete()
        return None

    if reaction:
        reaction.type = reaction_type
        reaction.full_clean()
        reaction.save(update_fields=["type"])
        return reaction

    new_reaction = ProductReaction(product=product, user=user, type=reaction_type)
    new_reaction.full_clean()
    new_reaction.save()
    return new_reaction


def remove_product_reaction(product, user):
    """Remove active reaction for a user on a product."""

    _validate_reaction_allowed(product, user)

    deleted, _ = ProductReaction.objects.filter(product=product, user=user).delete()
    return deleted > 0


def get_product_reaction_summary(product, user):
    """Return likes/dislikes counters and current user reaction."""

    counts = ProductReaction.objects.filter(product=product).aggregate(
        likes_count=Count("id", filter=Q(type="like")),
        dislikes_count=Count("id", filter=Q(type="dislike")),
    )

    user_reaction = None
    if user and user.is_authenticated:
        user_reaction = (
            ProductReaction.objects.filter(product=product, user=user)
            .values_list("type", flat=True)
            .first()
        )

    return {
        "likes_count": counts["likes_count"] or 0,
        "dislikes_count": counts["dislikes_count"] or 0,
        "user_reaction": user_reaction,
    }
