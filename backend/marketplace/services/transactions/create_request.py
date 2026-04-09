from django.db import transaction as db_transaction
from django.utils import timezone
from rest_framework.exceptions import PermissionDenied

from marketplace.models import Products, Transaction
from marketplace.services.transaction_common import (
    ACTIVE_TRANSACTION_STATUSES,
    StateConflictError,
)
from marketplace.services.transaction_expiration import expire_transaction_if_needed
from marketplace.services.transaction_swap_context import encode_swap_context
from marketplace.services.transaction_swap_service import (
    validate_swap_product_for_buyer,
)


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


def _normalize_request_data(product, buyer, delivery_location, delivery_date, swap_product_id):
    normalized_delivery_location = delivery_location
    normalized_delivery_date = delivery_date

    if product.transaction_type != "swap":
        return normalized_delivery_location, normalized_delivery_date

    if swap_product_id is None:
        raise StateConflictError(
            "El intercambio requiere un producto propuesto por el comprador."
        )

    swap_product = validate_swap_product_for_buyer(
        swap_product_id=swap_product_id,
        buyer_id=buyer.pk,
    )
    normalized_delivery_location = encode_swap_context(swap_product_id=swap_product.pk)
    normalized_delivery_date = None
    return normalized_delivery_location, normalized_delivery_date


def create_transaction_request(
    product_id,
    buyer,
    delivery_location,
    delivery_date,
    swap_product_id=None,
):
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

        normalized_delivery_location, normalized_delivery_date = _normalize_request_data(
            product=product,
            buyer=buyer,
            delivery_location=delivery_location,
            delivery_date=delivery_date,
            swap_product_id=swap_product_id,
        )

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
                delivery_location=normalized_delivery_location,
                delivery_date=normalized_delivery_date,
            )
            _set_product_in_progress(product)

            # TODO: Integrar creación de notificaciones cuando el módulo CORE lo exponga.
            return transaction

        transaction = Transaction.objects.create(
            product=product,
            seller=product.seller,
            buyer=buyer,
            transaction_type=product.transaction_type,
            delivery_date=normalized_delivery_date,
            delivery_location=normalized_delivery_location,
            status="pendiente",
        )

        _set_product_in_progress(product)

        # TODO: Integrar creación de notificaciones cuando el módulo CORE lo exponga.
        return transaction
