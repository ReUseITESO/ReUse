from core.models import User


class MockAuthMiddleware:
    """Middleware that reads X-Mock-User-Id header and attaches user to request.

    This is a temporary mock for development until the core team
    implements real authentication. Replace this middleware when
    JWT/session auth is available.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        mock_user_id = request.headers.get("X-Mock-User-Id")
        request.mock_user = self._resolve_user(mock_user_id)
        return self.get_response(request)

    def _resolve_user(self, user_id):
        if not user_id:
            return None
        try:
            return User.objects.get(pk=int(user_id))
        except (User.DoesNotExist, ValueError, TypeError):
            return None
