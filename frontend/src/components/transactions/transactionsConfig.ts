import type {
  Transaction,
  TransactionStatus,
  UpdatableTransactionStatus,
} from '@/types/transaction';

export type TransactionRole = 'buyer' | 'seller';

export const STATUS_FILTERS: Array<{ label: string; value?: TransactionStatus }> = [
  { label: 'Todas' },
  { label: 'Pendientes', value: 'pendiente' },
  { label: 'Confirmadas', value: 'confirmada' },
  { label: 'Completadas', value: 'completada' },
  { label: 'Canceladas', value: 'cancelada' },
];

export function getActorRole(transaction: Transaction, userId: number): TransactionRole {
  if (transaction.seller.id === userId) {
    return 'seller';
  }
  return 'buyer';
}

export function shouldAllowStatusChange(
  transaction: Transaction,
  actorRole: TransactionRole,
  targetStatus: UpdatableTransactionStatus,
) {
  if (
    transaction.is_expired ||
    transaction.status === 'cancelada' ||
    transaction.status === 'completada'
  ) {
    return false;
  }

  if (targetStatus === 'confirmada') {
    return (
      transaction.status === 'pendiente' &&
      actorRole === 'seller' &&
      transaction.transaction_type !== 'swap'
    );
  }

  if (targetStatus === 'cancelada') {
    return transaction.status === 'pendiente' || transaction.status === 'confirmada';
  }

  if (transaction.status !== 'confirmada') {
    return false;
  }

  if (actorRole === 'seller') {
    return !transaction.seller_confirmation;
  }

  return !transaction.buyer_confirmation;
}

export function hasActorConfirmed(transaction: Transaction, actorRole: TransactionRole): boolean {
  if (actorRole === 'seller') {
    return transaction.seller_confirmation;
  }

  return transaction.buyer_confirmation;
}

export function getDeliveryConfirmationLabel(actorRole: TransactionRole): string {
  if (actorRole === 'seller') {
    return 'Confirmar entrega';
  }

  return 'Confirmar que lo recibi';
}

export function getPendingCounterpartLabel(
  transaction: Transaction,
): 'vendedor' | 'comprador' | null {
  if (transaction.seller_confirmation && !transaction.buyer_confirmation) {
    return 'comprador';
  }

  if (!transaction.seller_confirmation && transaction.buyer_confirmation) {
    return 'vendedor';
  }

  return null;
}

export function getTransactionTypeLabel(type: Transaction['transaction_type']) {
  if (type === 'sale') return 'Venta';
  if (type === 'donation') return 'Donación';
  return 'Intercambio';
}
