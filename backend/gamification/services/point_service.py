from django.db import transaction
from rest_framework.exceptions import ValidationError

from gamification.models.point_rule import PointRule
from gamification.models.point_transaction import PointTransaction


def award_points(user, action, reference_id=None):
    try:
        rule = PointRule.objects.get(action=action, is_active=True)
    except PointRule.DoesNotExist:
        raise ValidationError('Point rule not configured')

    with transaction.atomic():
        point_transaction = PointTransaction.objects.create(
            user=user,
            action=action,
            points=rule.points,
            reference_id=reference_id,
        )

        user.points += rule.points
        user.save(update_fields=['points'])

    return point_transaction

def deduct_points(user, points, reference_id=None):

    if user.points < points:
        raise ValidationError("User does not have enough points")

    with transaction.atomic():

        PointTransaction.objects.create(
            user=user,
            action="points_deduction",
            points=-points,
            reference_id=reference_id,
        )

        user.points -= points
        user.save(update_fields=["points"])