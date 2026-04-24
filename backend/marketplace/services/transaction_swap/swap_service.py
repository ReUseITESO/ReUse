from django.db import transaction as db_transaction
from django.utils import timezone
from rest_framework.exceptions import NotFound, PermissionDenied

from marketplace.models import Products, SwapTransaction, Transaction
from marketplace.services.transaction_common import (
    StateConflictError,
    get_actor_role,
)

SWAP_PROPOSAL_STAGE_TRANSITIONS = {
    SwapTransaction.Stage.PROPOSAL_PENDING: [
        SwapTransaction.Stage.PROPOSAL_ACCEPTED,
        SwapTransaction.Stage.PROPOSAL_REJECTED,
    ],
    SwapTransaction.Stage.PROPOSAL_ACCEPTED: [
        SwapTransaction.Stage.AGENDA_PENDING,
    ],
    SwapTransaction.Stage.AGENDA_PENDING: [
        SwapTransaction.Stage.AGENDA_ACCEPTED,
        SwapTransaction.Stage.AGENDA_REJECTED,
    ],
}


def _validate_swap_stage_transition(current_stage, next_stage):
    allowed = SWAP_PROPOSAL_STAGE_TRANSITIONS.get(current_stage, [])
    if next_stage not in allowed:
        raise StateConflictError(
            f"No se puede transicionar de '{current_stage}' a '{next_stage}'."
        )


def get_swap_transaction(transaction_id):
    try:
        return SwapTransaction.objects.select_related(
            "transaction",
            "proposed_product",
            "proposed_product__category",
        ).get(transaction_id=transaction_id)
    except SwapTransaction.DoesNotExist as err:
        raise NotFound("No existe una propuesta de intercambio para esta transacción.") from err


def create_swap_proposal(transaction_id, proposed_product_id, buyer):
    with db_transaction.atomic():
        try:
            transaction = (
                Transaction.objects.select_for_update()
                .select_related("product", "seller", "buyer")
                .get(pk=transaction_id)
            )
        except Transaction.DoesNotExist as err:
            raise NotFound("La transacción no existe.") from err

        if transaction.buyer_id != buyer.pk:
            raise PermissionDenied("Solo el comprador puede proponer el artículo de intercambio.")

        if transaction.transaction_type != "swap":
            raise StateConflictError("Esta transacción no es de tipo intercambio.")

        if transaction.status not in ("pendiente",):
            raise StateConflictError(
                "La propuesta solo puede enviarse en transacciones pendientes."
            )

        try:
            proposed_product = Products.objects.select_for_update().get(pk=proposed_product_id)
        except Products.DoesNotExist as err:
            raise NotFound("El artículo propuesto no existe.") from err

        if proposed_product.seller_id != buyer.pk:
            raise PermissionDenied("Solo puedes proponer artículos que te pertenecen.")

        if proposed_product.status != "disponible":
            raise StateConflictError("El artículo propuesto debe estar disponible.")

        if SwapTransaction.objects.filter(transaction=transaction).exists():
            raise StateConflictError("Ya existe una propuesta de intercambio para esta transacción.")

        swap = SwapTransaction.objects.create(
            transaction=transaction,
            proposed_product=proposed_product,
            stage=SwapTransaction.Stage.PROPOSAL_PENDING,
        )

        # TODO(core-team): Notificar al vendedor que el comprador propuso un artículo de intercambio.
        return swap


def respond_to_proposal(transaction_id, accept, actor):
    with db_transaction.atomic():
        try:
            transaction = (
                Transaction.objects.select_for_update()
                .select_related("seller", "buyer")
                .get(pk=transaction_id)
            )
        except Transaction.DoesNotExist as err:
            raise NotFound("La transacción no existe.") from err

        actor_role = get_actor_role(transaction, actor)

        if actor_role != "seller":
            raise PermissionDenied("Solo el vendedor puede responder a la propuesta de intercambio.")

        swap = (
            SwapTransaction.objects.select_for_update()
            .select_related("proposed_product")
            .get(transaction=transaction)
        )

        next_stage = (
            SwapTransaction.Stage.PROPOSAL_ACCEPTED
            if accept
            else SwapTransaction.Stage.PROPOSAL_REJECTED
        )
        _validate_swap_stage_transition(swap.stage, next_stage)

        swap.stage = next_stage
        swap.proposal_decided_at = timezone.now()
        swap.save(update_fields=["stage", "proposal_decided_at", "updated_at"])

        # TODO(core-team): Notificar al comprador el resultado de la propuesta de intercambio.
        return swap


def propose_swap_agenda(transaction_id, agenda_location, delivery_date, actor):
    with db_transaction.atomic():
        try:
            transaction = (
                Transaction.objects.select_for_update()
                .select_related("seller", "buyer")
                .get(pk=transaction_id)
            )
        except Transaction.DoesNotExist as err:
            raise NotFound("La transacción no existe.") from err

        actor_role = get_actor_role(transaction, actor)

        if actor_role != "buyer":
            raise PermissionDenied("Solo el comprador puede proponer la fecha y lugar de encuentro.")

        swap = SwapTransaction.objects.select_for_update().get(transaction=transaction)

        _validate_swap_stage_transition(swap.stage, SwapTransaction.Stage.AGENDA_PENDING)

        swap.stage = SwapTransaction.Stage.AGENDA_PENDING
        swap.agenda_location = agenda_location
        swap.save(update_fields=["stage", "agenda_location", "updated_at"])

        transaction.delivery_date = delivery_date
        transaction.save(update_fields=["delivery_date"])

        # TODO(core-team): Notificar al vendedor que el comprador propuso fecha y lugar.
        return swap


def respond_to_agenda(transaction_id, accept, actor):
    with db_transaction.atomic():
        try:
            transaction = (
                Transaction.objects.select_for_update()
                .select_related("seller", "buyer")
                .get(pk=transaction_id)
            )
        except Transaction.DoesNotExist as err:
            raise NotFound("La transacción no existe.") from err

        actor_role = get_actor_role(transaction, actor)

        if actor_role != "seller":
            raise PermissionDenied("Solo el vendedor puede responder a la propuesta de agenda.")

        swap = SwapTransaction.objects.select_for_update().get(transaction=transaction)

        next_stage = (
            SwapTransaction.Stage.AGENDA_ACCEPTED
            if accept
            else SwapTransaction.Stage.AGENDA_REJECTED
        )
        _validate_swap_stage_transition(swap.stage, next_stage)

        swap.stage = next_stage
        swap.agenda_decided_at = timezone.now()
        swap.save(update_fields=["stage", "agenda_decided_at", "updated_at"])

        if accept:
            transaction.delivery_location = swap.agenda_location
            transaction.save(update_fields=["delivery_location"])

        # TODO(core-team): Notificar al comprador el resultado de la propuesta de agenda.
        return swap
