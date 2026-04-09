import Link from 'next/link';
import { Eye, FolderOpen } from 'lucide-react';

import { getCategoryStyle } from '@/lib/productStyles';
import { cn } from '@/lib/utils';

import type { TransactionProductSummary } from '@/types/transaction';

import {
  getSwapConditionLabel,
  getSwapStatusLabel,
  getSwapTypeLabel,
} from '@/components/transactions/swapFlow/productLabels';

interface SwapProductPreviewProps {
  product: TransactionProductSummary;
  titlePrefix?: string;
  compact?: boolean;
}

export default function SwapProductPreview({
  product,
  titlePrefix = 'Producto propuesto',
  compact = false,
}: SwapProductPreviewProps) {
  const containerClass = compact
    ? 'rounded-md border border-warning/30 bg-card p-2.5'
    : 'rounded-lg border border-border bg-card p-3 sm:p-4';

  const titleClass = compact ? 'text-sm font-semibold text-fg' : 'text-base font-semibold text-fg';
  const descriptionClass = compact ? 'line-clamp-1' : 'line-clamp-2';
  const categoryClass = getCategoryStyle(product.category.name);

  return (
    <article className={containerClass}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-fg">{titlePrefix}</p>
          <Link
            href={`/products/${product.id}`}
            className={cn(titleClass, 'mt-1 line-clamp-1 hover:text-primary hover:underline')}
          >
            {product.title}
          </Link>
        </div>

        <Link
          href={`/products/${product.id}`}
          className="inline-flex items-center gap-1 rounded-md border border-input px-2 py-1 text-xs text-fg transition-colors hover:bg-muted"
          aria-label="Ver producto propuesto"
          title="Ver producto propuesto"
        >
          <Eye className="h-3.5 w-3.5" />
          Ver
        </Link>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs', categoryClass)}>
          {product.category.name}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs text-primary">
          {getSwapTypeLabel(product.transaction_type)}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-warning/30 bg-warning/10 px-2 py-0.5 text-xs text-warning-fg">
          {getSwapConditionLabel(product.condition)}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-xs text-accent">
          {getSwapStatusLabel(product.status)}
        </span>
      </div>

      <p className={cn('mt-2 text-xs text-muted-fg', descriptionClass)}>{product.description}</p>
    </article>
  );
}
