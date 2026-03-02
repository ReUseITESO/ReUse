from django.apps import AppConfig


class CoreConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "core"

    # TODO: uncomment when signals.py has signal handlers
    # def ready(self):
    #     import core.signals  # noqa: F401
