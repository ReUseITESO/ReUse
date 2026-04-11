from django.db.models.signals import post_save
from django.dispatch import receiver
<<<<<<< HEAD

from core.models.user import User
from gamification.services.badge_service import evaluate_milestones
from marketplace.models.product import Products
from marketplace.models.transaction import Transaction


@receiver(post_save, sender=Products)
def product_post_save(sender, instance, created, **kwargs):
    if created:
        evaluate_milestones(instance.seller)
    else:
        update_fields = kwargs.get("update_fields")
        if not update_fields or "status" in update_fields or "transaction_type" in update_fields:
            evaluate_milestones(instance.seller)


@receiver(post_save, sender=Transaction)
def transaction_post_save(sender, instance, created, **kwargs):
    if instance.status == "completada":
        evaluate_milestones(instance.seller)
        evaluate_milestones(instance.buyer)


@receiver(post_save, sender=User)
def user_post_save(sender, instance, created, **kwargs):
    if created:
        evaluate_milestones(instance)
    else:
        update_fields = kwargs.get("update_fields")
        if not update_fields or "phone" in update_fields or "profile_picture" in update_fields:
            evaluate_milestones(instance)
=======
from rest_framework.exceptions import ValidationError

from gamification.models import ChallengeType, PointAction, PointTransaction
from gamification.services.challenge_service import refresh_user_active_challenges
from gamification.services.point_service import award_points
from marketplace.models import Products, Transaction, TransactionReview

POINT_ACTION_TO_CHALLENGE_TYPES = {
    PointAction.PUBLISH_ITEM: [ChallengeType.PUBLISH],
    PointAction.COMPLETE_DONATION: [ChallengeType.DONATION],
    PointAction.COMPLETE_SALE: [ChallengeType.SALE],
    PointAction.COMPLETE_EXCHANGE: [ChallengeType.EXCHANGE],
    PointAction.RECEIVE_POSITIVE_REVIEW: [ChallengeType.REVIEW],
}


@receiver(post_save, sender=PointTransaction)
def refresh_challenges_on_point_transaction(sender, instance, created, **kwargs):
    if not created:
        return

    challenge_types = POINT_ACTION_TO_CHALLENGE_TYPES.get(instance.action)
    if not challenge_types:
        return

    refresh_user_active_challenges(user=instance.user, challenge_types=challenge_types)


@receiver(post_save, sender=Products)
def award_points_on_product_publish(sender, instance, created, **kwargs):
    if not created:
        return

    try:
        award_points(
            user=instance.seller,
            action=PointAction.PUBLISH_ITEM,
            reference_id=instance.id,
        )
    except ValidationError:
        # If point rules are missing, keep product published and skip gamification points.
        return


@receiver(post_save, sender=Transaction)
def refresh_challenges_on_completed_transaction(sender, instance, **kwargs):
    # Fallback update for challenge progress when transaction status changes,
    # even if point rules are missing or points were not awarded.
    if instance.status != "completada":
        return

    type_map = {
        "donation": [ChallengeType.DONATION],
        "sale": [ChallengeType.SALE],
        "swap": [ChallengeType.EXCHANGE],
    }
    challenge_types = type_map.get(instance.transaction_type, [])
    if not challenge_types:
        return

    refresh_user_active_challenges(user=instance.seller, challenge_types=challenge_types)
    refresh_user_active_challenges(user=instance.buyer, challenge_types=challenge_types)


@receiver(post_save, sender=TransactionReview)
def award_points_on_positive_review(sender, instance, created, **kwargs):
    if not created:
        return

    if instance.rating < 4:
        return

    try:
        award_points(
            user=instance.reviewee,
            action=PointAction.RECEIVE_POSITIVE_REVIEW,
            reference_id=instance.id,
        )
    except ValidationError:
        # If point rules are missing, keep review saved and skip gamification points.
        return
>>>>>>> 4d3465df85cc2992e20bf566c58da49dfe2c6a45
