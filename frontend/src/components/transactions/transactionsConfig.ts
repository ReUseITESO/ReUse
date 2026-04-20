import type {
  Transaction,
  TransactionStatus,
  UpdatableTransactionStatus,
} from '@/types/transaction';

export type TransactionRole = 'buyer' | 'seller';

export const STATUS_FILTERS: Array<{ label: string; value?: TransactionStatus }> = [
  { label: 'Todas' },
  { label: 'Pendientes', value: 'pendiente' },
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
    if (transaction.transaction_type === 'swap' && transaction.swap_stage) {
      return false;
    }
    return transaction.status === 'pendiente' && actorRole === 'seller';
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
    return 'Confirmar producto entregado';
  }

  return 'Confirmar producto recibido';
}

export function getPendingCounterpartLabel(transaction: Transaction): string | null {
  const sellerName = `${transaction.seller.first_name} ${transaction.seller.last_name}`.trim();
  const buyerName = `${transaction.buyer.first_name} ${transaction.buyer.last_name}`.trim();

  if (transaction.seller_confirmation && !transaction.buyer_confirmation) {
    return buyerName;
  }

  if (!transaction.seller_confirmation && transaction.buyer_confirmation) {
    return sellerName;
  }

  return null;
}

export function getTransactionTypeLabel(type: Transaction['transaction_type']) {
  if (type === 'sale') return 'Venta';
  if (type === 'donation') return 'Donación';
  return 'Intercambio';
}
