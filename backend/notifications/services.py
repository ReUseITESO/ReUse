from django.contrib.auth import get_user_model

from .models import Notification

User = get_user_model()


def _create(
    recipient,
    notification_type,
    title,
    message,
    related_object_id=None,
    related_object_type=None,
    action_url=None,
):
    return Notification.objects.create(
        recipient=recipient,
        notification_type=notification_type,
        title=title,
        message=message,
        related_object_id=related_object_id,
        related_object_type=related_object_type,
        action_url=action_url,
    )


def notify_new_message(recipient, sender, conversation_id):
    return _create(
        recipient=recipient,
        notification_type=Notification.NotificationType.NEW_MESSAGE,
        title="New message",
        message=f"{sender.get_full_name() or sender.username} sent you a message.",
        related_object_id=conversation_id,
        related_object_type="conversation",
        action_url=f"/messages/{conversation_id}/",
    )


def notify_item_request(recipient, requester, item_id, item_title):
    return _create(
        recipient=recipient,
        notification_type=Notification.NotificationType.ITEM_REQUEST,
        title="New item request",
        message=f"{requester.get_full_name() or requester.username} is interested in '{item_title}'.",
        related_object_id=item_id,
        related_object_type="item",
        action_url=f"/items/{item_id}/",
    )


def notify_transaction_update(recipient, transaction_id, status_label):
    return _create(
        recipient=recipient,
        notification_type=Notification.NotificationType.TRANSACTION_UPDATE,
        title="Transaction update",
        message=f"Your transaction #{transaction_id} status changed to: {status_label}.",
        related_object_id=transaction_id,
        related_object_type="transaction",
        action_url=f"/transactions/{transaction_id}/",
    )


def notify_gamification_achievement(recipient, achievement_name, achievement_id=None):
    return _create(
        recipient=recipient,
        notification_type=Notification.NotificationType.GAMIFICATION_ACHIEVEMENT,
        title="Achievement unlocked 🏆",
        message=f"You earned the achievement: {achievement_name}!",
        related_object_id=achievement_id,
        related_object_type="achievement",
        action_url="/profile/achievements/",
    )


def notify_item_sold(recipient, item_id, item_title):
    return _create(
        recipient=recipient,
        notification_type=Notification.NotificationType.ITEM_SOLD,
        title="Your item was sold!",
        message=f"'{item_title}' has been sold. Check your transactions.",
        related_object_id=item_id,
        related_object_type="item",
        action_url=f"/items/{item_id}/",
    )


def notify_offer_received(recipient, offerer, item_id, item_title):
    return _create(
        recipient=recipient,
        notification_type=Notification.NotificationType.OFFER_RECEIVED,
        title="New offer received",
        message=f"{offerer.get_full_name() or offerer.username} made an offer on '{item_title}'.",
        related_object_id=item_id,
        related_object_type="item",
        action_url=f"/items/{item_id}/offers/",
    )
