from django.db import transaction as db_transaction
from django.utils import timezone
from rest_framework.exceptions import PermissionDenied

from marketplace.models import Transaction
from marketplace.services.transaction_common import (
    StateConflictError,
    award_completion_points,
    get_actor_role,
    validate_transition,
)
from marketplace.services.transaction_expiration import expire_transaction_if_needed


def _confirm_transaction(transaction, actor_role):
    if actor_role != "seller":
        raise PermissionDenied("Solo el vendedor puede aceptar la solicitud.")

    transaction.status = "confirmada"
    transaction.save(update_fields=["status"])

    # TODO: Integrar notificación al comprador cuando CORE publique servicio.
    return transaction


def _cancel_transaction(transaction):
    transaction.status = "cancelada"
    transaction.save(update_fields=["status"])

    product = transaction.product
    if product.status != "disponible":
        product.status = "disponible"
        product.save(update_fields=["status", "updated_at"])

    # TODO: Integrar notificación de cancelación cuando CORE esté listo.
    return transaction


def _update_delivery_confirmations(transaction, actor_role):
    confirmation_time = timezone.now()
    update_fields = []

    if actor_role == "seller" and not transaction.seller_confirmation:
        transaction.seller_confirmation = True
        transaction.seller_confirmed_at = confirmation_time
        update_fields.extend(["seller_confirmation", "seller_confirmed_at"])

    if actor_role == "buyer" and not transaction.buyer_confirmation:
        transaction.buyer_confirmation = True
        transaction.buyer_confirmed_at = confirmation_time
        update_fields.extend(["buyer_confirmation", "buyer_confirmed_at"])

    if transaction.seller_confirmation and transaction.buyer_confirmation:
        transaction.status = "completada"
        update_fields.append("status")

        if transaction.delivery_date is None:
            transaction.delivery_date = confirmation_time
            update_fields.append("delivery_date")

        product = transaction.product
        if product.status != "completado":
            product.status = "completado"
            product.save(update_fields=["status", "updated_at"])

        award_completion_points(transaction)

        # TODO: Integrar notificación de completado cuando CORE esté listo.

    if update_fields:
        transaction.save(update_fields=update_fields)

    return transaction


def update_transaction_status(transaction_id, new_status, actor):
    with db_transaction.atomic():
        transaction = Transaction.objects.select_for_update().select_related(
            "product",
            "seller",
            "buyer",
        ).get(pk=transaction_id)

        actor_role = get_actor_role(transaction, actor)

        if expire_transaction_if_needed(transaction):
            raise StateConflictError(
                "La transacción expiró y fue cancelada automáticamente."
            )

        validate_transition(transaction.status, new_status)

        if new_status == "confirmada":
            return _confirm_transaction(transaction, actor_role)

        if new_status == "cancelada":
            return _cancel_transaction(transaction)

        return _update_delivery_confirmations(transaction, actor_role)
