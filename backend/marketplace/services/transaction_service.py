from django.db import transaction as db_transaction
from django.utils import timezone
from rest_framework.exceptions import PermissionDenied

from marketplace.models import Products, Transaction
from marketplace.services.transaction_common import (
    ACTIVE_TRANSACTION_STATUSES,
    UPDATABLE_TRANSACTION_STATUSES,
    StateConflictError,
    award_completion_points,
    get_actor_role,
    has_active_transaction,
    validate_transition,
)
from marketplace.services.transaction_expiration import (
    expire_transaction_if_needed,
    expire_user_transactions,
    get_expiration_datetime,
    is_transaction_expired,
    list_transactions_for_user,
)

__all__ = [
    "ACTIVE_TRANSACTION_STATUSES",
    "UPDATABLE_TRANSACTION_STATUSES",
    "create_transaction_request",
    "expire_transaction_if_needed",
    "expire_user_transactions",
    "get_expiration_datetime",
    "has_active_transaction",
    "is_transaction_expired",
    "list_transactions_for_user",
    "update_transaction_status",
]


def _set_product_in_progress(product):
    if product.status != "en_proceso":
        product.status = "en_proceso"
        product.save(update_fields=["status", "updated_at"])


def _reuse_cancelled_transaction(
    transaction,
    product,
    buyer,
    delivery_location,
    delivery_date,
):
    transaction.seller = product.seller
    transaction.buyer = buyer
    transaction.transaction_type = product.transaction_type
    transaction.delivery_location = delivery_location
    transaction.status = "pendiente"
    transaction.seller_confirmation = False
    transaction.seller_confirmed_at = None
    transaction.buyer_confirmation = False
    transaction.buyer_confirmed_at = None
    transaction.delivery_date = delivery_date
    transaction.created_at = timezone.now()
    transaction.save(
        update_fields=[
            "seller",
            "buyer",
            "transaction_type",
            "delivery_location",
            "status",
            "seller_confirmation",
            "seller_confirmed_at",
            "buyer_confirmation",
            "buyer_confirmed_at",
            "delivery_date",
            "created_at",
        ]
    )
    return transaction


def create_transaction_request(product_id, buyer, delivery_location, delivery_date):
    with db_transaction.atomic():
        try:
            product = Products.objects.select_for_update().select_related("seller").get(
                pk=product_id
            )
        except Products.DoesNotExist as err:
            raise StateConflictError("El producto no existe.") from err

        if product.seller_id == buyer.pk:
            raise PermissionDenied("No puedes solicitar tu propio producto.")

        if product.status != "disponible":
            raise StateConflictError("Solo se pueden solicitar productos disponibles.")

        try:
            existing_transaction = product.transaction
        except Transaction.DoesNotExist:
            existing_transaction = None

        if existing_transaction is not None:
            expire_transaction_if_needed(existing_transaction)
            if existing_transaction.status in ACTIVE_TRANSACTION_STATUSES:
                raise StateConflictError("El producto ya tiene una transacción activa.")

            if existing_transaction.status != "cancelada":
                raise StateConflictError(
                    "El producto no permite crear una nueva solicitud en su estado actual."
                )

            transaction = _reuse_cancelled_transaction(
                transaction=existing_transaction,
                product=product,
                buyer=buyer,
                delivery_location=delivery_location,
                delivery_date=delivery_date,
            )
            _set_product_in_progress(product)

            # TODO: Integrar creación de notificaciones cuando el módulo CORE lo exponga.
            return transaction

        transaction = Transaction.objects.create(
            product=product,
            seller=product.seller,
            buyer=buyer,
            transaction_type=product.transaction_type,
            delivery_date=delivery_date,
            delivery_location=delivery_location,
            status="pendiente",
        )

        _set_product_in_progress(product)

        # TODO: Integrar creación de notificaciones cuando el módulo CORE lo exponga.
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
            if actor_role != "seller":
                raise PermissionDenied("Solo el vendedor puede aceptar la solicitud.")

            transaction.status = "confirmada"
            transaction.save(update_fields=["status"])

            # TODO: Integrar notificación al comprador cuando CORE publique servicio.
            return transaction

        if new_status == "cancelada":
            transaction.status = "cancelada"
            transaction.save(update_fields=["status"])

            product = transaction.product
            if product.status != "disponible":
                product.status = "disponible"
                product.save(update_fields=["status", "updated_at"])

            # TODO: Integrar notificación de cancelación cuando CORE esté listo.
            return transaction

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

            # Preserve the originally scheduled handoff date.
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
