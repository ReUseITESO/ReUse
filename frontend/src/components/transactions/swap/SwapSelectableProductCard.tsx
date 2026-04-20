'use client';

import { CheckCircle2 } from 'lucide-react';

import CategoryPlaceholderIcon from '@/components/products/CategoryPlaceholderIcon';
import Badge from '@/components/ui/Badge';
import {
  getCategoryStyle,
  getConditionLabel,
  getConditionStyle,
  getTransactionTypeStyle,
} from '@/lib/productStyles';
import { formatPrice, formatTransactionLabel } from '@/lib/utils';

import type { Product } from '@/types/product';

interface SwapSelectableProductCardProps {
  product: Product;
  isSelected: boolean;
  onSelect: (productId: number) => void;
}

export default function SwapSelectableProductCard({
  product,
  isSelected,
  onSelect,
}: SwapSelectableProductCardProps) {
  const selectedClass = isSelected
    ? 'border-secondary bg-secondary/10'
    : 'border-border bg-card hover:bg-muted/40';
  const formattedPrice = formatPrice(product.price);

  return (
    <button
      type="button"
      onClick={() => onSelect(product.id)}
      className={`w-full rounded-xl border p-3 text-left transition-colors ${selectedClass}`}
      aria-pressed={isSelected}
    >
      <article className="flex items-center gap-3 sm:gap-4">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-border bg-card sm:h-20 sm:w-20">
          {product.images?.[0]?.image_url ? (
            <img
              src={product.images[0].image_url}
              alt={product.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 bg-muted text-muted-fg">
              <CategoryPlaceholderIcon categoryName={product.category.name} />
              <span className="text-xs">Sin imagen</span>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <p className="line-clamp-2 text-sm font-semibold text-fg sm:text-body">
              {product.title}
            </p>
            {isSelected && <CheckCircle2 className="h-4 w-4 shrink-0 text-secondary" />}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <Badge className={getCategoryStyle(product.category.name)}>
              {product.category.name}
            </Badge>
            <Badge className={getConditionStyle(product.condition)}>
              {getConditionLabel(product.condition)}
            </Badge>
            <Badge className={getTransactionTypeStyle(product.transaction_type)}>
              {formatTransactionLabel(product.transaction_type)}
            </Badge>
            {formattedPrice && (
              <Badge
                variant="green"
                className="bg-success/10 text-success border border-success/30"
              >
                {formattedPrice}
              </Badge>
            )}
          </div>
        </div>
      </article>
    </button>
  );
}
