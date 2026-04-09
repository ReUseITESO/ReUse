import { CheckCircle2 } from 'lucide-react';

import {
  getSwapConditionLabel,
  getSwapStatusLabel,
  getSwapTypeLabel,
} from '@/components/transactions/swapFlow/productLabels';
import { getCategoryStyle } from '@/lib/productStyles';
import { cn } from '@/lib/utils';

import type { Product } from '@/types/product';

interface SelectableSwapProductCardProps {
  product: Product;
  isSelected: boolean;
  disabled: boolean;
  onSelect: (productId: number) => void;
}

export default function SelectableSwapProductCard({
  product,
  isSelected,
  disabled,
  onSelect,
}: SelectableSwapProductCardProps) {
  const categoryClass = getCategoryStyle(product.category.name);

  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        'w-full rounded-lg border p-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60',
        isSelected
          ? 'border-primary bg-primary/10 shadow-sm shadow-primary/20'
          : 'border-border bg-muted/30 hover:border-info/40 hover:bg-muted',
      )}
      onClick={() => onSelect(product.id)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="line-clamp-1 text-sm font-semibold text-fg">{product.title}</p>
            {isSelected && (
              <span className="inline-flex items-center gap-1 rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success">
                <CheckCircle2 className="h-3 w-3" />
                Seleccionado
              </span>
            )}
          </div>

          <p className="mt-2 line-clamp-2 text-xs text-muted-fg">{product.description}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
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
    </button>
  );
}
