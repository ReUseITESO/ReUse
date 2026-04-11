from django.contrib.auth import get_user_model
from django.db.models import Avg

from gamification.models.environment_impact import EnvironmentImpact

User = get_user_model()


def get_user_impact(user):
    try:
        user_impact = EnvironmentImpact.objects.get(user=user)
        items_reused = user_impact.reused_products
        co2_avoided = float(user_impact.kg_co2_saved)
    except EnvironmentImpact.DoesNotExist:
        items_reused = 0
        co2_avoided = 0.0

    # community stats
    aggs = EnvironmentImpact.objects.aggregate(
        avg_items=Avg("reused_products"), avg_co2=Avg("kg_co2_saved")
    )

    avg_items = aggs.get("avg_items") or 0.0
    avg_co2 = aggs.get("avg_co2") or 0.0

    return {
        "items_reused": items_reused,
        "co2_avoided": round(co2_avoided, 2),
        "community_average_items": round(float(avg_items), 2),
        "community_average_co2": round(float(avg_co2), 2),
    }
