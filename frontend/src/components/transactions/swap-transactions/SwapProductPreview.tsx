import Link from 'next/link';
import { Eye } from 'lucide-react';
import CategoryPlaceholderIcon from '@/components/products/CategoryPlaceholderIcon';
import { cn, formatPrice, getImageUrl } from '@/lib/utils';
import {
  getCategoryStyle,
  getConditionStyle,
  getConditionLabel,
  getTransactionTypeStyle,
} from '@/lib/productStyles';
import { getTransactionTypeLabel } from '@/components/transactions/transactionsConfig';
import ProductBadge from '@/components/ui/ProductBadge';
import type { TransactionProductSummary, SwapProposedProduct } from '@/types/transaction';

interface SwapProductPreviewProps {
  product: TransactionProductSummary | SwapProposedProduct;
  label: string;
  className?: string;
  showDescription?: boolean;
}

export default function SwapProductPreview({
  product,
  label,
  className,
  showDescription = false,
}: SwapProductPreviewProps) {
  const catStyle = getCategoryStyle(product.category.name);
  const condStyle = product.condition ? getConditionStyle(product.condition) : '';
  const typeStyle = getTransactionTypeStyle(product.transaction_type);

  const isSale = product.transaction_type === 'sale';
  const price = isSale && 'price' in product ? (product as TransactionProductSummary).price : null;

  const typeBadgeLabel = price
    ? formatPrice(price)
    : getTransactionTypeLabel(product.transaction_type);

  return (
    <div
      className={cn(
        'group relative flex-1 overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm transition-all duration-500 hover:border-primary/40 hover:shadow-lg',
        'before:absolute before:inset-0 before:bg-gradient-to-bl before:from-primary/10 before:via-transparent before:to-transparent before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100',
        className,
      )}
    >
      <div className="flex h-full min-h-[110px]">
        {/* Left Side: Full-height Image Container */}
        <div className="relative w-28 shrink-0 overflow-hidden border-r border-border/40 sm:w-32">
          {product.image_url ? (
            <img
              src={getImageUrl(product.image_url)}
              alt={product.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className={cn('flex h-full w-full items-center justify-center', catStyle)}>
              <CategoryPlaceholderIcon
                categoryName={product.category.name}
                className="h-8 w-8 opacity-60"
              />
            </div>
          )}
          {/* Subtle overlay on image */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/5 to-transparent pointer-events-none" />
        </div>

        {/* Right Side: Product Details */}
        <div className="relative flex flex-1 flex-col justify-between p-3 sm:p-4">
          <div className="min-w-0 pr-8">
            <p className="text-[10px] font-bold text-muted-fg/60 uppercase tracking-widest mb-1.5 leading-none">
              {label}
            </p>
            <Link
              href={`/products/${product.id}`}
              className="block max-w-full truncate text-sm font-bold text-fg hover:text-primary transition-colors decoration-primary/30 underline-offset-4 hover:underline"
            >
              {product.title}
            </Link>
          </div>

          {/* Badges Container */}
          <div className="mt-3 flex flex-wrap gap-2">
            <ProductBadge
              label={typeBadgeLabel}
              className={cn(typeStyle, 'px-2 py-0.5 text-[10px] font-bold tracking-wide')}
            />
            <ProductBadge
              label={product.category.name}
              className={cn(catStyle, 'px-2 py-0.5 text-[10px] font-bold tracking-wide')}
            />
            {product.condition && (
              <ProductBadge
                label={getConditionLabel(product.condition)}
                className={cn(condStyle, 'px-2 py-0.5 text-[10px] font-bold tracking-wide')}
              />
            )}
          </div>

          {showDescription && 'description' in product && product.description && (
            <p className="mt-3 text-sm text-muted-fg line-clamp-3">{product.description}</p>
          )}

          {/* Small Eye Button - Absolutely positioned to the top right of the text area */}
          <Link
            href={`/products/${product.id}`}
            className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-lg bg-muted/60 text-muted-fg transition-all duration-300 hover:bg-primary hover:text-primary-fg hover:shadow-md border border-border/40 active:scale-90"
            title="Ver detalle del producto"
          >
            <Eye className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
