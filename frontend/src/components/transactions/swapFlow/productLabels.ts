import { formatConditionLabel, formatTransactionLabel } from '@/lib/utils';

import type { ProductCondition, ProductStatus, TransactionType } from '@/types/product';

const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  disponible: 'Disponible',
  pausado: 'Pausado',
  en_proceso: 'En proceso',
  completado: 'Completado',
  cancelado: 'Cancelado',
};

export function getSwapTypeLabel(transactionType: TransactionType): string {
  return formatTransactionLabel(transactionType);
}

export function getSwapConditionLabel(condition?: ProductCondition | null): string {
  if (!condition) {
    return 'Sin condición';
  }

  return formatConditionLabel(condition);
}

export function getSwapStatusLabel(status: ProductStatus): string {
  return PRODUCT_STATUS_LABELS[status];
}
