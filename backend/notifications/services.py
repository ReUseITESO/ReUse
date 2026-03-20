from django.contrib.auth import get_user_model

from .models import Notification

User = get_user_model()


def create_notification(
    user: User,
    notification_type: str,
    message: str,
    reference_id: int | None = None,
    reference_type: str | None = None,
) -> Notification:
    return Notification.objects.create(
        user=user,
        type=notification_type,
        message=message,
        reference_id=reference_id,
        reference_type=reference_type,
    )