from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from gamification.models import (
    ChallengeType,
    PointAction,
    PointTransaction,
    UserChallenge,
)
from marketplace.models import Transaction


def calculate_user_challenge_progress(user_challenge):
    challenge = user_challenge.challenge

    if challenge.challenge_type == ChallengeType.DONATION:
        transaction_progress = Transaction.objects.filter(
            seller=user_challenge.user,
            transaction_type="donation",
            status="completada",
            created_at__gte=challenge.start_date,
            created_at__lte=challenge.end_date,
        ).count()
        point_progress = PointTransaction.objects.filter(
            user=user_challenge.user,
            action=PointAction.COMPLETE_DONATION,
            created_at__gte=challenge.start_date,
            created_at__lte=challenge.end_date,
        ).count()
        return max(transaction_progress, point_progress)

    if challenge.challenge_type == ChallengeType.SALE:
        transaction_progress = Transaction.objects.filter(
            seller=user_challenge.user,
            transaction_type="sale",
            status="completada",
            created_at__gte=challenge.start_date,
            created_at__lte=challenge.end_date,
        ).count()
        point_progress = PointTransaction.objects.filter(
            user=user_challenge.user,
            action=PointAction.COMPLETE_SALE,
            created_at__gte=challenge.start_date,
            created_at__lte=challenge.end_date,
        ).count()
        return max(transaction_progress, point_progress)

    if challenge.challenge_type == ChallengeType.PUBLISH:
        return PointTransaction.objects.filter(
            user=user_challenge.user,
            action=PointAction.PUBLISH_ITEM,
            created_at__gte=challenge.start_date,
            created_at__lte=challenge.end_date,
        ).count()

    if challenge.challenge_type == ChallengeType.REVIEW:
        return PointTransaction.objects.filter(
            user=user_challenge.user,
            action=PointAction.RECEIVE_POSITIVE_REVIEW,
            created_at__gte=challenge.start_date,
            created_at__lte=challenge.end_date,
        ).count()

    transaction_progress = Transaction.objects.filter(
        Q(seller=user_challenge.user) | Q(buyer=user_challenge.user),
        transaction_type="swap",
        status="completada",
        created_at__gte=challenge.start_date,
        created_at__lte=challenge.end_date,
    ).count()
    point_progress = PointTransaction.objects.filter(
        user=user_challenge.user,
        action=PointAction.COMPLETE_EXCHANGE,
        created_at__gte=challenge.start_date,
        created_at__lte=challenge.end_date,
    ).count()
    return max(transaction_progress, point_progress)


def join_challenge(*, user, challenge):
    now = timezone.now()
    if not challenge.is_active:
        raise ValidationError("Challenge is not active")
    if now < challenge.start_date:
        raise ValidationError("Challenge has not started yet")
    if now > challenge.end_date:
        raise ValidationError("Challenge has already ended")

    user_challenge, created = UserChallenge.objects.get_or_create(
        user=user,
        challenge=challenge,
    )

    if not created:
        raise ValidationError("You already joined this challenge")

    refresh_user_challenge_progress(user_challenge)
    return user_challenge


def refresh_user_challenge_progress(user_challenge):
    with transaction.atomic():
        locked = UserChallenge.objects.select_for_update().select_related(
            "challenge",
            "user",
        ).get(id=user_challenge.id)

        progress = calculate_user_challenge_progress(locked)
        has_new_completion = (
            not locked.is_completed and progress >= locked.challenge.goal
        )

        locked.progress = progress
        if has_new_completion:
            locked.is_completed = True
            locked.completed_at = timezone.now()
        locked.save(update_fields=["progress", "is_completed", "completed_at", "updated_at"])

        if has_new_completion and locked.challenge.bonus_points > 0:
            PointTransaction.objects.create(
                user=locked.user,
                action="challenge_completion",
                points=locked.challenge.bonus_points,
                reference_id=locked.challenge.id,
            )
            locked.user.points += locked.challenge.bonus_points
            locked.user.save(update_fields=["points"])

    return locked
