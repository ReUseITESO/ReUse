from django.db import transaction as db_transaction
from rest_framework.exceptions import PermissionDenied

from marketplace.models import Transaction
from marketplace.services.transaction_common import StateConflictError, get_actor_role
from marketplace.services.transaction_expiration import expire_transaction_if_needed
from marketplace.services.transaction_swap_context import (
    MEETING_ACCEPTED,
    MEETING_NOT_DEFINED,
    MEETING_PENDING,
    encode_swap_context,
    parse_swap_context,
)


def propose_swap_meeting(
    transaction_id: int,
    actor,
    delivery_location: str,
    delivery_date,
) -> Transaction:
    with db_transaction.atomic():
        transaction = Transaction.objects.select_for_update().select_related(
            "product",
            "seller",
            "buyer",
        ).get(pk=transaction_id)

        if transaction.transaction_type != "swap":
            raise StateConflictError(
                "Solo las transacciones de intercambio permiten negociar agenda."
            )

        get_actor_role(transaction, actor)

        if expire_transaction_if_needed(transaction):
            raise StateConflictError(
                "La transacción expiró y fue cancelada automáticamente."
            )

        if transaction.status != "confirmada":
            raise StateConflictError(
                "La agenda solo se puede proponer cuando la transacción está confirmada."
            )

        context = parse_swap_context(transaction.delivery_location)
        if context is None:
            raise StateConflictError(
                "No se encontró una propuesta de intercambio válida para esta transacción."
            )

        transaction.delivery_location = encode_swap_context(
            swap_product_id=context.swap_product_id,
            meeting_status=MEETING_PENDING,
            meeting_proposer_id=actor.pk,
            meeting_location=delivery_location,
        )
        transaction.delivery_date = delivery_date
        transaction.save(update_fields=["delivery_location", "delivery_date"])

        # TODO(core-team): Notificar a la contraparte sobre nueva propuesta de agenda.
        return transaction


def respond_swap_meeting(transaction_id: int, actor, accepted: bool) -> Transaction:
    with db_transaction.atomic():
        transaction = Transaction.objects.select_for_update().select_related(
            "product",
            "seller",
            "buyer",
        ).get(pk=transaction_id)

        if transaction.transaction_type != "swap":
            raise StateConflictError(
                "Solo las transacciones de intercambio permiten responder agenda."
            )

        get_actor_role(transaction, actor)

        if expire_transaction_if_needed(transaction):
            raise StateConflictError(
                "La transacción expiró y fue cancelada automáticamente."
            )

        if transaction.status != "confirmada":
            raise StateConflictError(
                "La agenda solo se puede responder cuando la transacción está confirmada."
            )

        context = parse_swap_context(transaction.delivery_location)
        if context is None or context.meeting_status != MEETING_PENDING:
            raise StateConflictError("No hay una agenda pendiente por responder.")

        if context.meeting_proposer_id == actor.pk:
            raise PermissionDenied("No puedes responder tu propia propuesta de agenda.")

        if accepted:
            next_status = MEETING_ACCEPTED
            next_location = context.meeting_location
        else:
            next_status = MEETING_NOT_DEFINED
            next_location = ""
            transaction.delivery_date = None

        transaction.delivery_location = encode_swap_context(
            swap_product_id=context.swap_product_id,
            meeting_status=next_status,
            meeting_proposer_id=0,
            meeting_location=next_location,
        )

        update_fields = ["delivery_location"]
        if not accepted:
            update_fields.append("delivery_date")
        transaction.save(update_fields=update_fields)

        # TODO(core-team): Notificar resultado de agenda (aceptada/rechazada) a la contraparte.
        return transaction
