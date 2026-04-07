import Badge from '@/components/ui/Badge';
import {
  getCategoryStyle,
  getConditionLabel,
  getConditionStyle,
  getTransactionTypeStyle,
} from '@/lib/productStyles';
import { formatPrice, formatTransactionLabel } from '@/lib/utils';

import type { ProductBasicDetailsProps } from '@/types/product';

export default function ProductBasicDetails({
  title,
  description,
  categoryName,
  condition,
  fallbackConditionLabel = 'Sin condición',
  transactionType,
  price,
  showTransactionBadge = false,
}: ProductBasicDetailsProps) {
  const categoryClass = getCategoryStyle(categoryName);
  const conditionClass = condition
    ? getConditionStyle(condition)
    : 'bg-muted text-muted-fg border border-border';
  const conditionLabel = condition ? getConditionLabel(condition) : fallbackConditionLabel;

  const transactionTypeClass = transactionType
    ? getTransactionTypeStyle(transactionType)
    : 'bg-muted text-muted-fg border border-border';

  const transactionTypeLabel =
    transactionType === 'sale'
      ? (() => {
          const formattedPrice = formatPrice(price ?? null);
          return formattedPrice ? `Venta ${formattedPrice}` : 'Venta';
        })()
      : transactionType
        ? formatTransactionLabel(transactionType)
        : null;

  return (
    <div className="space-y-2 text-sm text-fg">
      <p className="text-body font-semibold text-fg">{title}</p>
      <div className="inline-flex flex-wrap items-center gap-2">
        <Badge className={categoryClass}>{categoryName}</Badge>
        <Badge className={conditionClass}>{conditionLabel}</Badge>
        {showTransactionBadge && transactionTypeLabel && (
          <Badge className={transactionTypeClass}>{transactionTypeLabel}</Badge>
        )}
      </div>
      <p className="text-sm text-muted-fg">{description}</p>
    </div>
  );
}
