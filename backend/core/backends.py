from django.contrib.auth import get_user_model  # type: ignore[reportMissingModuleSource]
from django.contrib.auth.backends import ModelBackend  # type: ignore[reportMissingModuleSource]

User = get_user_model()


class EmailBackend(ModelBackend):
    """
    Backend de autenticacion que usa email en lugar de username.
    """

    def authenticate(self, _request, email=None, password=None, **kwargs):
        if email is None:
            email = kwargs.get("username")
        if email is None:
            return None

        try:
            user = User.objects.get(email=email.lower().strip())
        except User.DoesNotExist:
            User().set_password(password)
            return None

        if user.check_password(password):
            return user
        return None