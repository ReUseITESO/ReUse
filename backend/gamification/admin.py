# Scaffolding: admin registrations for gamification models.
# Uncomment after adding "gamification" to INSTALLED_APPS in settings.py
# and running makemigrations for this app.
#
# from django.contrib import admin
#
# from gamification.models import Badges, UserBadges, EnvironmentImpact
#
#
# @admin.register(Badges)
# class BadgesAdmin(admin.ModelAdmin):
#     list_display = ["id", "name", "rarity", "points"]
#
#
# @admin.register(UserBadges)
# class UserBadgesAdmin(admin.ModelAdmin):
#     list_display = ["id", "user", "badges", "earned_at"]
#
#
# @admin.register(EnvironmentImpact)
# class EnvironmentImpactAdmin(admin.ModelAdmin):
#     list_display = ["id", "user", "kg_co2_saved", "reused_products"]
