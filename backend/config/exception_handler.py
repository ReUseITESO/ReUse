from rest_framework.exceptions import (
    AuthenticationFailed,
    NotFound,
    PermissionDenied,
    ValidationError,
)
from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        error_code = "SERVER_ERROR"

        if isinstance(exc, ValidationError):
            error_code = "VALIDATION_ERROR"
        elif isinstance(exc, AuthenticationFailed):
            error_code = "AUTHENTICATION_ERROR"
        elif isinstance(exc, PermissionDenied):
            error_code = "PERMISSION_DENIED"
        elif isinstance(exc, NotFound):
            error_code = "NOT_FOUND"
        elif response.status_code == 409:
            error_code = "STATE_CONFLICT"

        custom_response_data = {
            "error": {
                "code": error_code,
                "message": str(exc),
                "details": response.data if isinstance(response.data, dict) else {},
            }
        }

        response.data = custom_response_data

    return response
