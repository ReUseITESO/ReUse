import type { ProductCondition, ProductStatus, TransactionType } from '@/types/product';

const CATEGORY_STYLES: Record<string, string> = {
  Libros: 'bg-cat-books/10 text-cat-books border border-cat-books/30',
  Electronica: 'bg-cat-electronics/10 text-cat-electronics border border-cat-electronics/30',
  'Ropa ITESO': 'bg-cat-clothing/10 text-cat-clothing border border-cat-clothing/30',
  Calculadoras: 'bg-cat-supplies/10 text-cat-supplies border border-cat-supplies/30',
  Apuntes: 'bg-accent/10 text-accent border border-accent/30',
};

const DEFAULT_CATEGORY_STYLE = 'bg-muted text-muted-fg border border-border';

export function getCategoryStyle(categoryName: string): string {
  return CATEGORY_STYLES[categoryName] ?? DEFAULT_CATEGORY_STYLE;
}

export type CategoryIconKind = 'books' | 'electronics' | 'clothing' | 'default';

export function getCategoryIconKind(categoryName: string): CategoryIconKind {
  const normalizedCategory = categoryName.toLowerCase();

  if (normalizedCategory.includes('libro')) {
    return 'books';
  }

  if (normalizedCategory.includes('electro')) {
    return 'electronics';
  }

  if (normalizedCategory.includes('ropa')) {
    return 'clothing';
  }

  return 'default';
}

export function getCategoryTextColorClass(categoryName: string): string {
  const categoryStyle = getCategoryStyle(categoryName);
  const textClass = categoryStyle.split(' ').find(className => className.startsWith('text-'));

  return textClass ?? 'text-muted-fg';
}

const CONDITION_STYLES: Record<ProductCondition, string> = {
  nuevo: 'bg-success/10 text-success border border-success/30',
  como_nuevo: 'bg-success/10 text-success border border-success/30',
  buen_estado: 'bg-info/10 text-info border border-info/30',
  usado: 'bg-warning/10 text-warning border border-warning/30',
};

export function getConditionStyle(condition: ProductCondition): string {
  return CONDITION_STYLES[condition] ?? 'bg-muted text-muted-fg border border-border';
}

const CONDITION_LABELS: Record<ProductCondition, string> = {
  nuevo: 'Nuevo',
  como_nuevo: 'Como Nuevo',
  buen_estado: 'Buen Estado',
  usado: 'Usado',
};

export function getConditionLabel(condition: ProductCondition): string {
  return CONDITION_LABELS[condition] ?? condition;
}

const PRICE_COLOR: Record<TransactionType, string> = {
  sale: 'text-success',
  donation: 'text-secondary',
  swap: 'text-secondary',
};

export function getPriceColor(transactionType: TransactionType): string {
  return PRICE_COLOR[transactionType] ?? 'text-secondary';
}

const TRANSACTION_TYPE_STYLES: Record<TransactionType, string> = {
  sale: 'bg-success/10 text-success border border-success/30',
  donation: 'bg-secondary/10 text-secondary border border-secondary/30',
  swap: 'bg-warning/10 text-warning border border-warning/30',
};

export function getTransactionTypeStyle(transactionType: TransactionType): string {
  return TRANSACTION_TYPE_STYLES[transactionType] ?? 'bg-muted text-muted-fg border border-border';
}

const STATUS_STYLES: Record<ProductStatus, { label: string; className: string }> = {
  disponible: {
    label: 'Disponible',
    className: 'bg-success/10 text-success border border-success/30',
  },
  pausado: {
    label: 'Pausado',
    className: 'bg-warning/10 text-warning border border-warning/30',
  },
  en_proceso: {
    label: 'En proceso',
    className: 'bg-warning/10 text-warning border border-warning/30',
  },
  completado: {
    label: 'Completado',
    className: 'bg-info/10 text-info border border-info/30',
  },
  cancelado: {
    label: 'Cancelado',
    className: 'bg-error/10 text-error border border-error/30',
  },
};

export function getStatusStyle(status: ProductStatus): { label: string; className: string } {
  return (
    STATUS_STYLES[status] ?? {
      label: status,
      className: 'bg-muted text-muted-fg border border-border',
    }
  );
}
