import random

from django.db import transaction
from django.db.models import Q
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from gamification.models import (
    Challenge,
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

    # Idempotent join: if the user is already joined, keep the same record.
    if not created:
        return refresh_user_challenge_progress(user_challenge)

    refresh_user_challenge_progress(user_challenge)
    return user_challenge


def ensure_user_active_challenges(*, user, challenge_types=None, now=None):
    if now is None:
        now = timezone.now()

    active_challenges = Challenge.objects.filter(
        is_active=True,
        start_date__lte=now,
        end_date__gte=now,
    ).order_by("id")
    if challenge_types:
        active_challenges = active_challenges.filter(challenge_type__in=challenge_types)

    active_challenge_ids = list(active_challenges.values_list("id", flat=True))
    if not active_challenge_ids:
        return []

    existing_ids = set(
        UserChallenge.objects.filter(
            user=user,
            challenge_id__in=active_challenge_ids,
        ).values_list("challenge_id", flat=True)
    )

    missing_ids = [cid for cid in active_challenge_ids if cid not in existing_ids]
    if missing_ids:
        UserChallenge.objects.bulk_create(
            [UserChallenge(user=user, challenge_id=cid) for cid in missing_ids],
            ignore_conflicts=True,
        )

    return list(
        UserChallenge.objects.select_related("challenge")
        .filter(user=user, challenge_id__in=active_challenge_ids)
        .order_by("challenge__end_date", "challenge__id")
    )


def refresh_user_challenge_progress(user_challenge):
    with transaction.atomic():
        locked = (
            UserChallenge.objects.select_for_update()
            .select_related(
                "challenge",
                "user",
            )
            .get(id=user_challenge.id)
        )

        progress = calculate_user_challenge_progress(locked)
        has_new_completion = (
            not locked.is_completed and progress >= locked.challenge.goal
        )

        locked.progress = progress
        if has_new_completion:
            locked.is_completed = True
            locked.completed_at = timezone.now()
        locked.save(
            update_fields=["progress", "is_completed", "completed_at", "updated_at"]
        )

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


def claim_challenge_reward(*, user, challenge):
    with transaction.atomic():
        user_challenge = (
            UserChallenge.objects.select_for_update()
            .select_related("challenge", "user")
            .filter(user=user, challenge=challenge)
            .first()
        )

        if user_challenge is None:
            raise ValidationError("Challenge is not assigned to the user")

        refreshed = refresh_user_challenge_progress(user_challenge)
        if not refreshed.is_completed:
            raise ValidationError("Challenge is not completed yet")

        if refreshed.reward_claimed:
            raise ValidationError("Reward already claimed")

        refreshed.reward_claimed = True
        refreshed.reward_claimed_at = timezone.now()
        refreshed.save(update_fields=["reward_claimed", "reward_claimed_at", "updated_at"])

    return refreshed


def refresh_user_active_challenges(*, user, challenge_types=None, now=None):
    if now is None:
        now = timezone.now()

    user_challenges = ensure_user_active_challenges(
        user=user,
        challenge_types=challenge_types,
        now=now,
    )

    refreshed = []
    for item in user_challenges:
        refreshed.append(refresh_user_challenge_progress(item))
    return refreshed


def get_rotative_challenges(now=None):
    """
    Select a subset of challenges that rotate daily/weekly/monthly.

    For each challenge type:
    - Daily: 3 challenges rotate each day
    - Weekly: 3 challenges rotate each week
    - Monthly: 3 challenges rotate each month

    Uses deterministic random selection based on date.
    """
    if now is None:
        now = timezone.now()

    daily_seed = now.date().day
    week_num = now.date().isocalendar()[1]
    month_num = now.date().month

    # Get all active challenges
    all_active = Challenge.objects.filter(
        is_active=True,
        start_date__lte=now,
        end_date__gte=now,
    ).order_by("id")

    # Categorize by duration
    daily_challenges = []
    weekly_challenges = []
    monthly_challenges = []

    for challenge in all_active:
        duration_days = (challenge.end_date - challenge.start_date).days

        if duration_days <= 2:
            daily_challenges.append(challenge)
        elif duration_days <= 10:
            weekly_challenges.append(challenge)
        else:
            monthly_challenges.append(challenge)

    selected = []

    # Select 3 daily challenges deterministically
    if daily_challenges:
        random.seed(daily_seed)
        daily_count = min(3, len(daily_challenges))
        selected.extend(random.sample(daily_challenges, daily_count))

    # Select 3 weekly challenges deterministically
    if weekly_challenges:
        random.seed(week_num)
        weekly_count = min(3, len(weekly_challenges))
        selected.extend(random.sample(weekly_challenges, weekly_count))

    # Select 3 monthly challenges deterministically
    if monthly_challenges:
        random.seed(month_num)
        monthly_count = min(3, len(monthly_challenges))
        selected.extend(random.sample(monthly_challenges, monthly_count))

    return selected
