'use client';

import { useState } from 'react';
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
  actions,
  disableShowMore = false,
}: ProductBasicDetailsProps) {
  const [showMore, setShowMore] = useState(false);
  const TRUNCATE_LIMIT = 220;
  const shouldUseInternalTruncation = !disableShowMore;
  const isTruncatable =
    shouldUseInternalTruncation && !!description && description.length > TRUNCATE_LIMIT;
  const displayedDescription =
    isTruncatable && !showMore
      ? `${description.slice(0, TRUNCATE_LIMIT).trimEnd()}...`
      : description;
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
      <div className="flex items-start justify-between gap-4">
        <p className="text-body font-semibold text-fg">{title}</p>
        {actions && <div className="shrink-0 ml-4">{actions}</div>}
      </div>

      <div className="inline-flex flex-wrap items-center gap-2">
        <Badge className={categoryClass}>{categoryName}</Badge>
        <Badge className={conditionClass}>{conditionLabel}</Badge>
        {showTransactionBadge && transactionTypeLabel && (
          <Badge className={transactionTypeClass}>{transactionTypeLabel}</Badge>
        )}
      </div>

      <div>
        <p className="text-sm text-muted-fg">{displayedDescription}</p>

        {isTruncatable && !disableShowMore && (
          <button
            type="button"
            onClick={() => setShowMore(s => !s)}
            className="mx-auto mt-3 flex w-full items-center justify-center gap-3 text-sm text-primary"
            aria-expanded={showMore}
          >
            <span className="hidden sm:inline-block flex-1 h-px bg-border" />
            <span className="px-3">{showMore ? 'Ver menos' : 'Ver más'}</span>
            <span className="hidden sm:inline-block flex-1 h-px bg-border" />
          </button>
        )}
      </div>
    </div>
  );
}
