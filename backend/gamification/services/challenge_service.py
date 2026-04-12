import random
from datetime import timedelta

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


def _get_challenge_bucket(challenge):
    duration_days = (challenge.end_date - challenge.start_date).days
    if duration_days <= 2:
        return "daily"
    if duration_days <= 10:
        return "weekly"
    return "monthly"


def _get_period_bounds(*, now, bucket):
    if bucket == "daily":
        period_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        return period_start, period_start + timedelta(days=1)

    if bucket == "weekly":
        day_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        period_start = day_start - timedelta(days=day_start.weekday())
        return period_start, period_start + timedelta(days=7)

    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    if month_start.month == 12:
        next_month = month_start.replace(year=month_start.year + 1, month=1)
    else:
        next_month = month_start.replace(month=month_start.month + 1)
    return month_start, next_month


def _reset_user_challenge_for_new_period(*, user_challenge, now):
    bucket = _get_challenge_bucket(user_challenge.challenge)
    period_start, period_end = _get_period_bounds(now=now, bucket=bucket)

    if period_start <= user_challenge.updated_at < period_end:
        return user_challenge

    user_challenge.progress = 0
    user_challenge.is_completed = False
    user_challenge.completed_at = None
    user_challenge.reward_claimed = False
    user_challenge.reward_claimed_at = None
    user_challenge.save(
        update_fields=[
            "progress",
            "is_completed",
            "completed_at",
            "reward_claimed",
            "reward_claimed_at",
            "updated_at",
        ]
    )
    return user_challenge


def calculate_user_challenge_progress(user_challenge):
    challenge = user_challenge.challenge
    now = timezone.now()
    bucket = _get_challenge_bucket(challenge)
    period_start, period_end = _get_period_bounds(now=now, bucket=bucket)

    if challenge.challenge_type == ChallengeType.DONATION:
        transaction_progress = Transaction.objects.filter(
            seller=user_challenge.user,
            transaction_type="donation",
            status="completada",
            created_at__gte=period_start,
            created_at__lt=period_end,
        ).count()
        point_progress = PointTransaction.objects.filter(
            user=user_challenge.user,
            action=PointAction.COMPLETE_DONATION,
            created_at__gte=period_start,
            created_at__lt=period_end,
        ).count()
        return max(transaction_progress, point_progress)

    if challenge.challenge_type == ChallengeType.SALE:
        transaction_progress = Transaction.objects.filter(
            seller=user_challenge.user,
            transaction_type="sale",
            status="completada",
            created_at__gte=period_start,
            created_at__lt=period_end,
        ).count()
        point_progress = PointTransaction.objects.filter(
            user=user_challenge.user,
            action=PointAction.COMPLETE_SALE,
            created_at__gte=period_start,
            created_at__lt=period_end,
        ).count()
        return max(transaction_progress, point_progress)

    if challenge.challenge_type == ChallengeType.PUBLISH:
        return PointTransaction.objects.filter(
            user=user_challenge.user,
            action=PointAction.PUBLISH_ITEM,
            created_at__gte=period_start,
            created_at__lt=period_end,
        ).count()

    if challenge.challenge_type == ChallengeType.REVIEW:
        return PointTransaction.objects.filter(
            user=user_challenge.user,
            action=PointAction.RECEIVE_POSITIVE_REVIEW,
            created_at__gte=period_start,
            created_at__lt=period_end,
        ).count()

    transaction_progress = Transaction.objects.filter(
        Q(seller=user_challenge.user) | Q(buyer=user_challenge.user),
        transaction_type="swap",
        status="completada",
        created_at__gte=period_start,
        created_at__lt=period_end,
    ).count()
    point_progress = PointTransaction.objects.filter(
        user=user_challenge.user,
        action=PointAction.COMPLETE_EXCHANGE,
        created_at__gte=period_start,
        created_at__lt=period_end,
    ).count()
    return max(transaction_progress, point_progress)


def join_challenge(*, user, challenge):
    if not challenge.is_active:
        raise ValidationError("Challenge is not active")

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

    active_challenges = get_rotative_challenges(now)
    if challenge_types:
        active_challenges = [
            challenge
            for challenge in active_challenges
            if challenge.challenge_type in challenge_types
        ]

    active_challenge_ids = [challenge.id for challenge in active_challenges]
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

    active_user_challenges = list(
        UserChallenge.objects.select_related("challenge")
        .filter(user=user, challenge_id__in=active_challenge_ids)
        .order_by("challenge__id")
    )

    for user_challenge in active_user_challenges:
        _reset_user_challenge_for_new_period(user_challenge=user_challenge, now=now)

    return active_user_challenges


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

        _reset_user_challenge_for_new_period(user_challenge=locked, now=timezone.now())

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

        if refreshed.challenge.bonus_points > 0:
            PointTransaction.objects.create(
                user=refreshed.user,
                action="challenge_completion",
                points=refreshed.challenge.bonus_points,
                reference_id=refreshed.challenge.id,
            )
            refreshed.user.points += refreshed.challenge.bonus_points
            refreshed.user.save(update_fields=["points"])

        refreshed.reward_claimed = True
        refreshed.reward_claimed_at = timezone.now()
        refreshed.save(
            update_fields=["reward_claimed", "reward_claimed_at", "updated_at"]
        )

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

    active_now = list(
        Challenge.objects.filter(
            is_active=True,
            start_date__lte=now,
            end_date__gte=now,
        ).order_by("id")
    )
    all_active = list(Challenge.objects.filter(is_active=True).order_by("id"))

    def split_by_bucket(challenges):
        grouped = {
            "daily": [],
            "weekly": [],
            "monthly": [],
        }
        for challenge in challenges:
            grouped[_get_challenge_bucket(challenge)].append(challenge)
        return grouped

    active_now_by_bucket = split_by_bucket(active_now)
    all_active_by_bucket = split_by_bucket(all_active)

    daily_challenges = (
        active_now_by_bucket["daily"]
        if active_now_by_bucket["daily"]
        else all_active_by_bucket["daily"]
    )
    weekly_challenges = (
        active_now_by_bucket["weekly"]
        if active_now_by_bucket["weekly"]
        else all_active_by_bucket["weekly"]
    )
    monthly_challenges = (
        active_now_by_bucket["monthly"]
        if active_now_by_bucket["monthly"]
        else all_active_by_bucket["monthly"]
    )

    selected = []

    # Select 3 daily challenges deterministically
    if daily_challenges:
        daily_rng = random.Random(daily_seed)
        daily_count = min(3, len(daily_challenges))
        selected.extend(daily_rng.sample(daily_challenges, daily_count))

    # Select 3 weekly challenges deterministically
    if weekly_challenges:
        weekly_rng = random.Random(week_num)
        weekly_count = min(3, len(weekly_challenges))
        selected.extend(weekly_rng.sample(weekly_challenges, weekly_count))

    # Select 3 monthly challenges deterministically
    if monthly_challenges:
        monthly_rng = random.Random(month_num)
        monthly_count = min(3, len(monthly_challenges))
        selected.extend(monthly_rng.sample(monthly_challenges, monthly_count))

    return selected
