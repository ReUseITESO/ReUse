from django.db.models import Q
from rest_framework.exceptions import ValidationError

from social.models import FrequentContact, UserConnection


def create_frequent_contact(user, contact_id: int) -> FrequentContact:
    if user.id == contact_id:
        raise ValidationError({"contact_id": "You cannot mark yourself as a frequent contact."})

    accepted_connection_exists = UserConnection.objects.filter(
        Q(requester=user, addressee_id=contact_id, status=UserConnection.Status.ACCEPTED)
        | Q(requester_id=contact_id, addressee=user, status=UserConnection.Status.ACCEPTED)
    ).exists()
    if not accepted_connection_exists:
        raise ValidationError(
            {"contact_id": "Only accepted connections can be marked as frequent contacts."}
        )

    frequent_contact, created = FrequentContact.objects.get_or_create(
        user=user,
        contact_id=contact_id,
    )
    if not created:
        raise ValidationError({"contact_id": "This contact is already marked as frequent."})

    return frequent_contact


def delete_frequent_contact(frequent_contact: FrequentContact, user) -> None:
    if frequent_contact.user_id != user.id:
        raise ValidationError({"detail": "You can only delete your own frequent contacts."})

    frequent_contact.delete()
