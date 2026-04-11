from django.db import transaction
from rest_framework.exceptions import ValidationError

from gamification.models.point_rule import PointRule, PointAction
from gamification.models.point_transaction import PointTransaction
from gamification.models.environment_impact import EnvironmentImpact

CO2_PER_ITEM = 2.5


def award_points(user, action, reference_id=None):
    try:
        rule = PointRule.objects.get(action=action, is_active=True)
    except PointRule.DoesNotExist as err:
        raise ValidationError("Point rule not configured") from err

    with transaction.atomic():
        point_transaction = PointTransaction.objects.create(
            user=user,
            action=action,
            points=rule.points,
            reference_id=reference_id,
        )

        user.points += rule.points
        user.save(update_fields=["points"])

        impact_actions = [
            PointAction.COMPLETE_DONATION,
            PointAction.COMPLETE_SALE,
            PointAction.COMPLETE_EXCHANGE,
        ]
        
        if action in impact_actions:
            impact, _ = EnvironmentImpact.objects.get_or_create(user=user)
            impact.reused_products += 1
            impact.kg_co2_saved = float(impact.kg_co2_saved) + CO2_PER_ITEM
            impact.save(update_fields=["reused_products", "kg_co2_saved"])

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