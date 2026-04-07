import logging

from rest_framework import status
from rest_framework.exceptions import APIException, PermissionDenied, ValidationError

from gamification.models.point_rule import PointAction
from gamification.services.point_service import award_points
from marketplace.models import Transaction

logger = logging.getLogger(__name__)

ACTIVE_TRANSACTION_STATUSES = ["pendiente", "confirmada"]
UPDATABLE_TRANSACTION_STATUSES = ["confirmada", "cancelada", "completada"]

TRANSACTION_STATUS_TRANSITIONS = {
    "pendiente": ["confirmada", "cancelada"],
    "confirmada": ["cancelada", "completada"],
    "cancelada": [],
    "completada": [],
}


class StateConflictError(APIException):
    status_code = status.HTTP_409_CONFLICT
    default_detail = "La transición de estado no es válida para esta transacción."
    default_code = "state_conflict"


def has_active_transaction(product):
    try:
        transaction = product.transaction
    except Transaction.DoesNotExist:
        return False

    return transaction.status in ACTIVE_TRANSACTION_STATUSES


def get_actor_role(transaction, actor):
    if transaction.seller_id == actor.pk:
        return "seller"
    if transaction.buyer_id == actor.pk:
        return "buyer"

    raise PermissionDenied("No tienes permisos para actuar sobre esta transacción.")


def validate_transition(current_status, new_status):
    allowed_statuses = TRANSACTION_STATUS_TRANSITIONS.get(current_status, [])
    if new_status not in allowed_statuses:
        raise StateConflictError(
            f"No se puede cambiar de '{current_status}' a '{new_status}'."
        )


def award_completion_points(transaction):
    # TODO(gamification-team): Definir reglas por rol para seller y buyer.
    # TODO(gamification-team): Definir política de idempotencia para evitar doble
    # asignación de puntos en reintentos o eventos duplicados.
    # TODO(gamification-team): Publicar evento de transacción completada para
    # auditoría y trazabilidad entre marketplace y gamification.
    action_by_type = {
        "donation": PointAction.COMPLETE_DONATION,
        "sale": PointAction.COMPLETE_SALE,
        "swap": PointAction.COMPLETE_EXCHANGE,
    }
    action = action_by_type.get(transaction.transaction_type)
    if action is None:
        return

    for user in [transaction.seller, transaction.buyer]:
        try:
            award_points(
                user=user,
                action=action,
                reference_id=transaction.pk,
            )
        except ValidationError:
            # TODO(gamification-team): Reemplazar fallback por integración
            # definitiva cuando exista cobertura completa de reglas en producción.
            logger.warning(
                "Point rule not configured for action=%s transaction=%s user=%s",
                action,
                transaction.pk,
                user.pk,
            )
