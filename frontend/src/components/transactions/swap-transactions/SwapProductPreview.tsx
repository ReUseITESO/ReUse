'use client';

import Link from 'next/link';
import { Eye } from 'lucide-react';
import CategoryPlaceholderIcon from '@/components/products/CategoryPlaceholderIcon';
import { cn } from '@/lib/utils';
import { getCategoryStyle, getConditionStyle, getConditionLabel, getTransactionTypeStyle } from '@/lib/productStyles';
import { getTransactionTypeLabel } from '@/components/transactions/transactionsConfig';
import ProductBadge from '@/components/ui/ProductBadge';
import type { TransactionProductSummary, SwapProposedProduct } from '@/types/transaction';

interface SwapProductPreviewProps {
  product: TransactionProductSummary | SwapProposedProduct;
  label: string;
  className?: string;
}

export default function SwapProductPreview({ product, label, className }: SwapProductPreviewProps) {
  const catStyle = getCategoryStyle(product.category.name);
  const condStyle = product.condition ? getConditionStyle(product.condition) : '';
  const typeStyle = getTransactionTypeStyle(product.transaction_type);

  return (
    <div className={cn('flex-1 rounded-lg border border-border bg-card p-3 shadow-sm transition-all hover:border-border/80', className)}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex gap-3 min-w-0 flex-1">
          {/* Product Thumbnail */}
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <CategoryPlaceholderIcon categoryName={product.category.name} className="h-6 w-6" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium text-muted-fg uppercase tracking-wider mb-0.5">
              {label}
            </p>
            <Link
              href={`/products/${product.id}`}
              className="block truncate text-sm font-bold text-fg hover:text-primary transition-colors"
            >
              {product.title}
            </Link>
          </div>
        </div>
        <Link
          href={`/products/${product.id}`}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-fg transition-all hover:bg-primary/10 hover:text-primary border border-border"
          title="Ver detalle del producto"
        >
          <Eye className="h-4 w-4" />
        </Link>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <ProductBadge
          label={getTransactionTypeLabel(product.transaction_type)}
          className={typeStyle}
        />
        <ProductBadge
          label={product.category.name}
          className={catStyle}
        />
        {product.condition && (
          <ProductBadge
            label={getConditionLabel(product.condition)}
            className={condStyle}
          />
        )}
      </div>
    </div>
  );
}
