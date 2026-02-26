# Scaffolding: Django app config for the gamification module.
# This file is required for Django to recognize gamification as an app.
# Uncomment ready() when you add signal handlers in signals.py.
from django.apps import AppConfig


class GamificationConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "gamification"

    # TODO: uncomment when signals.py has signal handlers
    # def ready(self):
    #     import gamification.signals  # noqa: F401
