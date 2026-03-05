# Scaffolding: admin registrations for gamification models.
# Uncomment after adding "gamification" to INSTALLED_APPS in settings.py
# and running makemigrations for this app.
#
from django.contrib import admin

from gamification.models import Badges, UserBadges, EnvironmentImpact

from gamification.models.point_rule import PointRule
from gamification.models.point_transaction import PointTransaction

@admin.register(Badges)
class BadgesAdmin(admin.ModelAdmin):
     list_display = ["id", "name", "rarity", "points"]


@admin.register(UserBadges)
class UserBadgesAdmin(admin.ModelAdmin):
     list_display = ["id", "user", "badges", "earned_at"]


@admin.register(EnvironmentImpact)
class EnvironmentImpactAdmin(admin.ModelAdmin):
     list_display = ["id", "user", "kg_co2_saved", "reused_products"]
     
@admin.register(PointRule)
class PointRuleAdmin(admin.ModelAdmin):
    list_display = ['action', 'points', 'is_active']

@admin.register(PointTransaction)
class PointTransactionAdmin(admin.ModelAdmin):
    list_display = ['user', 'action', 'points', 'created_at']
