import logging

from rest_framework.exceptions import (
    AuthenticationFailed,
    NotFound,
    PermissionDenied,
    Throttled,
    ValidationError,
)
from rest_framework.views import exception_handler

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        error_code = "SERVER_ERROR"

        if isinstance(exc, Throttled):
            error_code = "RATE_LIMIT_EXCEEDED"
            request = context.get("request")
            logger.warning(
                "rate_limit_exceeded path=%s method=%s user=%s ip=%s",
                request.path if request else "unknown",
                request.method if request else "unknown",
                str(request.user) if request else "unknown",
                request.META.get("REMOTE_ADDR", "unknown") if request else "unknown",
            )
        elif isinstance(exc, ValidationError):
            error_code = "VALIDATION_ERROR"
        elif isinstance(exc, AuthenticationFailed):
            error_code = "AUTHENTICATION_ERROR"
        elif isinstance(exc, PermissionDenied):
            error_code = "PERMISSION_DENIED"
        elif isinstance(exc, NotFound):
            error_code = "NOT_FOUND"
        elif response.status_code == 409:
            error_code = "STATE_CONFLICT"

        wait = getattr(exc, "wait", None)
        message = (
            f"Demasiadas solicitudes. Intenta de nuevo en {int(wait)} segundos."
            if isinstance(exc, Throttled) and wait
            else str(exc)
        )

        response.data = {
            "error": {
                "code": error_code,
                "message": message,
                "details": response.data if isinstance(response.data, dict) else {},
            }
        }

    return response
