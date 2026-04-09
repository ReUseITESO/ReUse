from datetime import timedelta

from django.db.models import Q
from django.utils import timezone

from marketplace.models import Transaction
from marketplace.services.transaction_common import ACTIVE_TRANSACTION_STATUSES

EXPIRATION_HOURS = 24


def get_expiration_datetime(transaction):
    return transaction.created_at + timedelta(hours=EXPIRATION_HOURS)


def is_transaction_expired(transaction, now=None):
    if transaction.status not in ACTIVE_TRANSACTION_STATUSES:
        return False

    current_time = now or timezone.now()
    return current_time >= get_expiration_datetime(transaction)


def expire_transaction_if_needed(transaction):
    if not is_transaction_expired(transaction):
        return False

    transaction.status = "cancelada"
    transaction.save(update_fields=["status"])

    product = transaction.product
    if product.status != "disponible":
        product.status = "disponible"
        product.save(update_fields=["status", "updated_at"])

    return True


def expire_user_transactions(user):
    transactions = (
        Transaction.objects.select_related("product")
        .filter(Q(seller=user) | Q(buyer=user), status__in=ACTIVE_TRANSACTION_STATUSES)
        .order_by("-created_at")
    )

    for transaction in transactions:
        expire_transaction_if_needed(transaction)


def list_transactions_for_user(user, role=None, status_filter=None):
    expire_user_transactions(user)

    queryset = Transaction.objects.select_related(
        "product",
        "product__category",
        "seller",
        "buyer",
    ).filter(Q(seller=user) | Q(buyer=user))

    if role == "seller":
        queryset = queryset.filter(seller=user)
    elif role == "buyer":
        queryset = queryset.filter(buyer=user)

    if status_filter:
        queryset = queryset.filter(status=status_filter)

    return queryset.order_by("-created_at")
