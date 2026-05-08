'use client';

import { Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getCategoryStyle,
  getConditionStyle,
  getConditionLabel,
  getTransactionTypeStyle,
} from '@/lib/productStyles';
import type { Product } from '@/types/product';
import { getTransactionTypeLabel } from '../transactionsConfig';

interface SwapProductCardProps {
  product: Product;
  isSelected: boolean;
  onToggle: (product: Product) => void;
}

export default function SwapProductCard({ product, isSelected, onToggle }: SwapProductCardProps) {
  const catStyle = getCategoryStyle(product.category.name);
  const condStyle = product.condition ? getConditionStyle(product.condition) : '';
  const typeStyle = getTransactionTypeStyle(product.transaction_type);

  return (
    <button
      type="button"
      onClick={() => onToggle(product)}
      className={cn(
        'group relative flex items-center gap-3 overflow-hidden rounded-lg border p-3 text-left transition-all duration-200',
        isSelected
          ? 'border-primary bg-primary/5 shadow-sm'
          : 'border-border bg-card hover:border-border/80 hover:bg-muted/50',
      )}
    >
      <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center overflow-hidden rounded-md bg-muted">
        {product.images[0] ? (
          <img
            src={product.images[0].image_url}
            alt={product.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <>
            <Package className="mb-1 h-6 w-6 text-accent opacity-60" />
            <span className="text-[10px] text-muted-fg font-medium">Sin imagen</span>
          </>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'truncate text-sm font-semibold transition-colors',
            isSelected ? 'text-primary' : 'text-fg',
          )}
        >
          {product.title}
        </p>
        <div className="mt-2 flex flex-wrap gap-1">
          <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', catStyle)}>
            {product.category.name}
          </span>
          {product.condition && (
            <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', condStyle)}>
              {getConditionLabel(product.condition)}
            </span>
          )}
          <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-medium', typeStyle)}>
            {getTransactionTypeLabel(product.transaction_type)}
          </span>
        </div>
      </div>

      {/* Checkmark indicator for selection */}
      {isSelected && (
        <div className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-fg">
          <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </button>
  );
}
