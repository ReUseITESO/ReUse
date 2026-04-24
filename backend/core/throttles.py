from rest_framework.throttling import (
    AnonRateThrottle,
    SimpleRateThrottle,
    UserRateThrottle,
)


def _get_client_ip(request):
    forwarded = request.META.get("HTTP_X_FORWARDED_FOR", "")
    return forwarded.split(",")[0].strip() or request.META.get("REMOTE_ADDR", "")


class AuthRateThrottle(SimpleRateThrottle):
    scope = "auth"

    def get_cache_key(self, request, view):
        return self.cache_format % {"scope": self.scope, "ident": _get_client_ip(request)}


class EmailVerificationRateThrottle(SimpleRateThrottle):
    scope = "email_verification"

    def get_cache_key(self, request, view):
        return self.cache_format % {"scope": self.scope, "ident": _get_client_ip(request)}


class ReactivationRateThrottle(SimpleRateThrottle):
    """HU-CORE-17: limitar solicitudes de reactivación para evitar spam de correos."""

    scope = "reactivation"

    def get_cache_key(self, request, view):
        return self.cache_format % {"scope": self.scope, "ident": _get_client_ip(request)}


class PasswordResetRateThrottle(SimpleRateThrottle):
    """HU-CORE-19: limitar solicitudes de restablecimiento de contraseña para evitar spam."""

    scope = "password_reset"

    def get_cache_key(self, request, view):
        return self.cache_format % {"scope": self.scope, "ident": _get_client_ip(request)}


class StandardAnonThrottle(AnonRateThrottle):
    scope = "anon"


class StandardUserThrottle(UserRateThrottle):
    scope = "user"
