from marketplace.models import Transaction

def has_active_transaction(product):
    try:
        transaction = product.transaction
    except Transaction.DoesNotExist:
        return False

    return transaction.status in ["pendiente", "confirmada"]