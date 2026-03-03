import Badge from '@/components/ui/Badge';
import { formatPrice, formatTimeAgo, formatTransactionLabel } from '@/lib/utils';

import type { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
}

const CATEGORY_COLORS: Record<string, string> = {
  Libros: 'bg-iteso-500/10 text-iteso-600',
  Electronica: 'bg-purple-500/10 text-purple-600',
  'Ropa ITESO': 'bg-pink-500/10 text-pink-600',
  Calculadoras: 'bg-amber-500/10 text-amber-600',
  Apuntes: 'bg-emerald-500/10 text-emerald-600',
};

const DEFAULT_CATEGORY_CLASS = 'bg-slate-100 text-slate-600';

function getCategoryClass(categoryName: string): string {
  return CATEGORY_COLORS[categoryName] ?? DEFAULT_CATEGORY_CLASS;
}

export default function ProductCard({ product }: ProductCardProps) {
  const timeAgo = formatTimeAgo(product.created_at);
  const isSale = product.transaction_type === 'sale';
  const transactionDisplay = isSale
    ? formatPrice(product.price)
    : formatTransactionLabel(product.transaction_type);
  const categoryClass = getCategoryClass(product.category.name);

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex h-44 items-center justify-center bg-slate-100">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-sm text-slate-400">
            {product.category.name}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <Badge className={categoryClass}>{product.category.name}</Badge>

        <h3 className="line-clamp-2 text-base font-semibold text-slate-900">
          {product.title}
        </h3>

        <p className="text-lg font-bold text-iteso-800">{transactionDisplay}</p>

        <div className="mt-auto flex flex-col gap-1 text-xs text-slate-400">
          <span className="flex items-center gap-1">{timeAgo}</span>
        </div>

        <div className="mt-2 flex items-center gap-2 border-t border-slate-100 pt-3">
          <span className="text-sm text-slate-600">{product.seller_name}</span>
        </div>
      </div>
    </article>
  );
}
