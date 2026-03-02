from django.apps import AppConfig


class MarketplaceConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "marketplace"

    # TODO: uncomment when signals.py has signal handlers
    # def ready(self):
    #     import marketplace.signals  # noqa: F401
