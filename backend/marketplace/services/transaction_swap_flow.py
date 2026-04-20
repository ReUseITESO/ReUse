from django.db import transaction as db_transaction
from rest_framework.exceptions import PermissionDenied

from marketplace.models import Products, Transaction
from marketplace.services.transaction_common import (
    StateConflictError,
    has_active_transaction,
)
from marketplace.services.transaction_swap_meta import (
    SWAP_STAGE_AGENDA_ACCEPTED,
    SWAP_STAGE_AGENDA_PENDING,
    SWAP_STAGE_AGENDA_REJECTED,
    SWAP_STAGE_PROPOSAL_ACCEPTED,
    SWAP_STAGE_PROPOSAL_PENDING,
    SWAP_STAGE_PROPOSAL_REJECTED,
    build_swap_meta,
    extract_agenda_location,
    extract_proposed_product_id,
    extract_swap_stage,
)


def _set_product_status(product, status):
    if product.status == status:
        return
    product.status = status
    product.save(update_fields=["status", "updated_at"])


def _get_swap_transaction(transaction_id):
    transaction = (
        Transaction.objects.select_for_update()
        .select_related("product", "seller", "buyer")
        .get(pk=transaction_id)
    )
    if transaction.transaction_type != "swap":
        raise StateConflictError("La transacción no es de intercambio.")
    return transaction


def _get_proposed_product(proposed_product_id):
    try:
        return Products.objects.select_for_update().get(pk=proposed_product_id)
    except Products.DoesNotExist as err:
        raise StateConflictError("El artículo propuesto no existe.") from err


def validate_swap_proposed_product(transaction, actor, proposed_product):
    if proposed_product.seller_id != actor.id:
        raise PermissionDenied("Solo puedes proponer artículos propios.")
    if proposed_product.id == transaction.product_id:
        raise StateConflictError("No puedes proponer el mismo artículo solicitado.")
    if proposed_product.status != "disponible":
        raise StateConflictError("Solo puedes proponer artículos disponibles.")
    if has_active_transaction(proposed_product):
        raise StateConflictError("El artículo propuesto ya tiene transacción activa.")


def set_swap_proposal(transaction_id, actor, proposed_product_id):
    with db_transaction.atomic():
        transaction = _get_swap_transaction(transaction_id)
        if transaction.buyer_id != actor.id:
            raise PermissionDenied("Solo el solicitante puede proponer artículos.")
        if transaction.status != "pendiente":
            raise StateConflictError("Solo puedes proponer en estado pendiente.")

        stage = extract_swap_stage(transaction.delivery_location)
        if stage not in {SWAP_STAGE_PROPOSAL_PENDING, SWAP_STAGE_PROPOSAL_REJECTED}:
            raise StateConflictError("No se permite reproponer artículo en esta etapa.")

        previous_id = extract_proposed_product_id(transaction.delivery_location)
        previous_product = None
        if previous_id:
            previous_product = _get_proposed_product(previous_id)

        proposed_product = _get_proposed_product(proposed_product_id)
        validate_swap_proposed_product(transaction, actor, proposed_product)

        _set_product_status(proposed_product, "en_proceso")
        if previous_product and previous_product.id != proposed_product.id:
            _set_product_status(previous_product, "disponible")

        transaction.delivery_location = build_swap_meta(
            proposed_product_id=proposed_product.id,
            stage=SWAP_STAGE_PROPOSAL_PENDING,
        )
        transaction.delivery_date = None
        transaction.save(update_fields=["delivery_location", "delivery_date"])
        return transaction


def decide_swap_proposal(transaction_id, actor, accepted):
    with db_transaction.atomic():
        transaction = _get_swap_transaction(transaction_id)
        if transaction.seller_id != actor.id:
            raise PermissionDenied("Solo el dueño puede decidir la propuesta.")
        if transaction.status != "pendiente":
            raise StateConflictError("Solo puedes decidir propuestas pendientes.")
        if (
            extract_swap_stage(transaction.delivery_location)
            != SWAP_STAGE_PROPOSAL_PENDING
        ):
            raise StateConflictError("No hay propuesta pendiente por decidir.")

        proposed_id = extract_proposed_product_id(transaction.delivery_location)
        proposed_product = _get_proposed_product(proposed_id)
        if accepted:
            transaction.delivery_location = build_swap_meta(
                proposed_id, SWAP_STAGE_PROPOSAL_ACCEPTED
            )
        else:
            transaction.delivery_location = build_swap_meta(
                proposed_id, SWAP_STAGE_PROPOSAL_REJECTED
            )
            _set_product_status(proposed_product, "disponible")
        transaction.save(update_fields=["delivery_location"])
        return transaction


def propose_swap_agenda(transaction_id, actor, delivery_location, delivery_date):
    with db_transaction.atomic():
        transaction = _get_swap_transaction(transaction_id)
        if transaction.buyer_id != actor.id:
            raise PermissionDenied("Solo el solicitante puede proponer agenda.")
        if transaction.status != "pendiente":
            raise StateConflictError("Solo puedes proponer agenda en estado pendiente.")

        stage = extract_swap_stage(transaction.delivery_location)
        if stage not in {SWAP_STAGE_PROPOSAL_ACCEPTED, SWAP_STAGE_AGENDA_REJECTED}:
            raise StateConflictError("Primero deben aceptar el artículo propuesto.")

        proposed_id = extract_proposed_product_id(transaction.delivery_location)
        transaction.delivery_location = build_swap_meta(
            proposed_product_id=proposed_id,
            stage=SWAP_STAGE_AGENDA_PENDING,
            agenda_location=delivery_location,
        )
        transaction.delivery_date = delivery_date
        transaction.save(update_fields=["delivery_location", "delivery_date"])
        return transaction


def decide_swap_agenda(transaction_id, actor, accepted):
    with db_transaction.atomic():
        transaction = _get_swap_transaction(transaction_id)
        if transaction.seller_id != actor.id:
            raise PermissionDenied("Solo el dueño puede decidir la agenda.")
        if transaction.status != "pendiente":
            raise StateConflictError("Solo puedes decidir agenda en estado pendiente.")
        if (
            extract_swap_stage(transaction.delivery_location)
            != SWAP_STAGE_AGENDA_PENDING
        ):
            raise StateConflictError("No hay agenda pendiente por decidir.")

        proposed_id = extract_proposed_product_id(transaction.delivery_location)
        agenda_location = extract_agenda_location(transaction.delivery_location)

        if accepted:
            transaction.status = "confirmada"
            transaction.delivery_location = build_swap_meta(
                proposed_product_id=proposed_id,
                stage=SWAP_STAGE_AGENDA_ACCEPTED,
                agenda_location=agenda_location,
            )
            transaction.save(update_fields=["status", "delivery_location"])
            return transaction

        transaction.delivery_location = build_swap_meta(
            proposed_product_id=proposed_id,
            stage=SWAP_STAGE_AGENDA_REJECTED,
        )
        transaction.delivery_date = None
        transaction.save(update_fields=["delivery_location", "delivery_date"])
        return transaction


def set_swap_proposed_status(transaction, status):
    proposed_id = extract_proposed_product_id(transaction.delivery_location)
    if not proposed_id:
        return
    proposed_product = _get_proposed_product(proposed_id)
    _set_product_status(proposed_product, status)
