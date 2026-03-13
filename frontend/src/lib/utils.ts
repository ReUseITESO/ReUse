import type { ProductCondition, TransactionType } from '@/types/product';

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

const TRANSACTION_LABELS: Record<TransactionType, string> = {
  donation: 'Donacion',
  sale: 'Venta',
  swap: 'Intercambio',
};

export function formatTransactionLabel(type: TransactionType): string {
  return TRANSACTION_LABELS[type];
}

const CONDITION_LABELS: Record<ProductCondition, string> = {
  nuevo: 'Nuevo',
  como_nuevo: 'Como nuevo',
  buen_estado: 'Buen estado',
  usado: 'Usado',
};

export function formatConditionLabel(condition: ProductCondition): string {
  return CONDITION_LABELS[condition];
}

export function formatPrice(price: string | null): string {
  if (!price) return '';
  const numeric = parseFloat(price);
  if (isNaN(numeric) || numeric === 0) return '';
  return `$${numeric.toLocaleString('es-MX')}`;
}

const SECONDS_IN_MINUTE = 60;
const SECONDS_IN_HOUR = 3_600;
const SECONDS_IN_DAY = 86_400;
const SECONDS_IN_WEEK = 604_800;

export function formatTimeAgo(isoDate: string): string {
  const now = Date.now();
  const then = new Date(isoDate).getTime();
  const diffSeconds = Math.floor((now - then) / 1_000);

  if (diffSeconds < SECONDS_IN_MINUTE) return 'Hace un momento';
  if (diffSeconds < SECONDS_IN_HOUR) {
    const minutes = Math.floor(diffSeconds / SECONDS_IN_MINUTE);
    return `Hace ${minutes} min`;
  }
  if (diffSeconds < SECONDS_IN_DAY) {
    const hours = Math.floor(diffSeconds / SECONDS_IN_HOUR);
    return `Hace ${hours} hora${hours !== 1 ? 's' : ''}`;
  }
  if (diffSeconds < SECONDS_IN_WEEK) {
    const days = Math.floor(diffSeconds / SECONDS_IN_DAY);
    return `Hace ${days} dia${days !== 1 ? 's' : ''}`;
  }

  return new Date(isoDate).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
  });
}
