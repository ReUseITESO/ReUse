from django.contrib.auth import get_user_model
from django.contrib.auth.backends import ModelBackend

User = get_user_model()


class EmailBackend(ModelBackend):
    """
    Backend de autenticación que usa email en lugar de username.
    """

    def authenticate(self, request, email=None, password=None, **kwargs):
        if email is None:
            email = kwargs.get("username")
        if email is None:
            return None

        try:
            user = User.objects.get(email=email.lower().strip())
        except User.DoesNotExist:
            User().set_password(password)
            return None

        if user.check_password(password) and self.user_can_authenticate(user):
            return user
        return None
