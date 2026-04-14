from rest_framework.throttling import (
    AnonRateThrottle,
    SimpleRateThrottle,
    UserRateThrottle,
)


class AuthRateThrottle(SimpleRateThrottle):
    scope = "auth"

    def get_cache_key(self, request, view):
        ident = request.META.get("HTTP_X_FORWARDED_FOR", "").split(",")[
            0
        ].strip() or request.META.get("REMOTE_ADDR", "")
        return self.cache_format % {"scope": self.scope, "ident": ident}


class EmailVerificationRateThrottle(SimpleRateThrottle):
    scope = "email_verification"

    def get_cache_key(self, request, view):
        ident = request.META.get("HTTP_X_FORWARDED_FOR", "").split(",")[
            0
        ].strip() or request.META.get("REMOTE_ADDR", "")
        return self.cache_format % {"scope": self.scope, "ident": ident}


class ReactivationRateThrottle(SimpleRateThrottle):
    """HU-CORE-17: limitar solicitudes de reactivación para evitar spam de correos."""

    scope = "reactivation"

    def get_cache_key(self, request, view):
        ident = request.META.get("HTTP_X_FORWARDED_FOR", "").split(",")[
            0
        ].strip() or request.META.get("REMOTE_ADDR", "")
        return self.cache_format % {"scope": self.scope, "ident": ident}


class StandardAnonThrottle(AnonRateThrottle):
    scope = "anon"


class StandardUserThrottle(UserRateThrottle):
    scope = "user"
