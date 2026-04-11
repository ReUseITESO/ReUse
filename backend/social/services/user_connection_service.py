from django.contrib.auth import get_user_model
from django.db.models import Q
from rest_framework.exceptions import PermissionDenied, ValidationError

from social.models import UserConnection

User = get_user_model()


def create_connection_request(requester, addressee_id: int) -> UserConnection:
    if requester.id == addressee_id:
        raise ValidationError(
            {"addressee_id": "You cannot send a request to yourself."}
        )

    addressee = User.objects.filter(id=addressee_id).first()
    if addressee is None:
        raise ValidationError({"addressee_id": "User not found."})

    if getattr(addressee, "is_deactivated", False):
        raise ValidationError({"addressee_id": "User not found."})

    existing_connection = UserConnection.objects.filter(
        Q(requester=requester, addressee=addressee)
        | Q(requester=addressee, addressee=requester)
    ).first()
    if existing_connection is not None:
        raise ValidationError(
            {"addressee_id": "A connection between these users already exists."}
        )

    return UserConnection.objects.create(
        requester=requester,
        addressee=addressee,
        status=UserConnection.Status.PENDING,
    )


def respond_to_connection(
    connection: UserConnection, user, new_status: str
) -> UserConnection:
    if connection.addressee_id != user.id:
        raise PermissionDenied("Only the addressee can respond to this request.")

    if connection.status != UserConnection.Status.PENDING:
        raise ValidationError({"status": "Only pending requests can be updated."})

    if new_status not in {
        UserConnection.Status.ACCEPTED,
        UserConnection.Status.REJECTED,
        UserConnection.Status.BLOCKED,
    }:
        raise ValidationError({"status": "Invalid status transition."})

    connection.status = new_status
    connection.save(update_fields=["status", "updated_at"])
    return connection
