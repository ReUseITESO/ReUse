from django.db import transaction as db_transaction
from rest_framework.exceptions import PermissionDenied

from marketplace.models import Products, Transaction
from marketplace.services.transaction_common import StateConflictError, get_actor_role
from marketplace.services.transaction_expiration import expire_transaction_if_needed
from marketplace.services.transaction_swap_context import encode_swap_context


def validate_swap_product_for_buyer(swap_product_id: int, buyer_id: int) -> Products:
    try:
        proposed_product = (
            Products.objects.select_for_update().select_related("seller").get(pk=swap_product_id)
        )
    except Products.DoesNotExist as err:
        raise StateConflictError("El producto propuesto para intercambio no existe.") from err

    if proposed_product.seller_id != buyer_id:
        raise PermissionDenied(
            "Solo puedes proponer productos publicados por tu propia cuenta."
        )

    if proposed_product.status != "disponible":
        raise StateConflictError(
            "Solo puedes proponer productos propios en estado disponible."
        )

    return proposed_product


def update_swap_proposal(transaction_id: int, actor, swap_product_id: int) -> Transaction:
    with db_transaction.atomic():
        transaction = Transaction.objects.select_for_update().select_related(
            "product",
            "seller",
            "buyer",
        ).get(pk=transaction_id)

        if transaction.transaction_type != "swap":
            raise StateConflictError(
                "Solo las transacciones de intercambio permiten reproponer artículos."
            )

        actor_role = get_actor_role(transaction, actor)
        if actor_role != "buyer":
            raise PermissionDenied("Solo el comprador puede enviar una nueva propuesta.")

        if expire_transaction_if_needed(transaction):
            raise StateConflictError(
                "La transacción expiró y fue cancelada automáticamente."
            )

        if transaction.status != "pendiente":
            raise StateConflictError(
                "Solo se puede reproponer intercambio cuando la solicitud está pendiente."
            )

        validate_swap_product_for_buyer(swap_product_id=swap_product_id, buyer_id=actor.pk)

        transaction.delivery_location = encode_swap_context(swap_product_id=swap_product_id)
        transaction.delivery_date = None
        transaction.save(update_fields=["delivery_location", "delivery_date"])

        # TODO(core-team): Notificar al vendedor sobre nueva propuesta de intercambio.
        return transaction


def mark_swap_proposal_not_accepted(transaction_id: int, actor) -> Transaction:
    with db_transaction.atomic():
        transaction = Transaction.objects.select_for_update().select_related(
            "product",
            "seller",
            "buyer",
        ).get(pk=transaction_id)

        if transaction.transaction_type != "swap":
            raise StateConflictError(
                "Solo las transacciones de intercambio permiten usar 'No aceptar'."
            )

        actor_role = get_actor_role(transaction, actor)
        if actor_role != "seller":
            raise PermissionDenied("Solo el vendedor puede no aceptar la propuesta.")

        if expire_transaction_if_needed(transaction):
            raise StateConflictError(
                "La transacción expiró y fue cancelada automáticamente."
            )

        if transaction.status != "pendiente":
            raise StateConflictError(
                "Solo se puede no aceptar mientras la solicitud está pendiente."
            )

        # TODO(core-team): Notificar al comprador que el vendedor no aceptó la propuesta.
        return transaction
