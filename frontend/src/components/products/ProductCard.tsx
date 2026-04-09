import Link from 'next/link';
import { Clock3, UserRound } from 'lucide-react';

import CategoryPlaceholderIcon from '@/components/products/CategoryPlaceholderIcon';
import Badge from '@/components/ui/Badge';
import { getCategoryStyle, getPriceColor } from '@/lib/productStyles';
import { formatPrice, formatTimeAgo, formatTransactionLabel } from '@/lib/utils';

import type { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const timeAgo = formatTimeAgo(product.created_at);
  const isSale = product.transaction_type === 'sale';
  const transactionDisplay = isSale
    ? formatPrice(product.price)
    : formatTransactionLabel(product.transaction_type);
  const categoryClass = getCategoryStyle(product.category.name);
  const priceColorClass = getPriceColor(product.transaction_type);

  return (
    <Link href={`/products/${product.id}`}>
      <article className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md cursor-pointer">
        <div className="flex h-44 items-center justify-center bg-muted">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-fg">
              <CategoryPlaceholderIcon categoryName={product.category.name} />
              <span className="text-sm"> Sin imagen</span>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2 p-4">
          <Badge className={categoryClass}>{product.category.name}</Badge>

          <h3 className="line-clamp-2 text-body font-semibold text-card-fg">{product.title}</h3>

          <p className={`text-h3 font-bold ${priceColorClass}`}>{transactionDisplay}</p>

          <div className="mt-auto flex flex-col gap-1 text-xs text-muted-fg">
            <span className="inline-flex items-center gap-1">
              <Clock3 className="h-3.5 w-3.5" />
              {timeAgo}
            </span>
          </div>

          <div className="mt-2 flex items-center gap-2 border-t border-border pt-3">
            <UserRound className="h-4 w-4 text-secondary" />
            <span className="text-sm text-fg">{product.seller_name}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
