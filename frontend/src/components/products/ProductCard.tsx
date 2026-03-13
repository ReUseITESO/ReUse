import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import { formatPrice, formatTimeAgo, formatTransactionLabel } from '@/lib/utils';

import type { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
}

const CATEGORY_COLORS: Record<string, string> = {
  Libros: 'bg-[#2B7FFF]/10 text-[#2B7FFF]',
  Electronica: 'bg-[#AD46FF]/10 text-[#AD46FF]',
  'Ropa ITESO': 'bg-[#F6339A]/10 text-[#F6339A]',
  Calculadoras: 'bg-[#FF6900]/10 text-[#FF6900]',
  Apuntes: 'bg-[#10B981]/10 text-[#10B981]',
};

const DEFAULT_CATEGORY_CLASS = 'bg-gray-100 text-gray-700';

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
    <Link href={`/products/${product.id}`}>
      <article className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md cursor-pointer">
        <div className="flex h-44 items-center justify-center bg-gray-100">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-sm text-gray-400">{product.category.name} - Imagen</span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2 p-4">
          <Badge className={categoryClass}>{product.category.name}</Badge>

          <h3 className="line-clamp-2 text-base font-semibold text-gray-900">{product.title}</h3>

          <p className="text-lg font-bold text-blue-600">{transactionDisplay}</p>

          <div className="mt-auto flex flex-col gap-1 text-xs text-gray-500">
            <span className="flex items-center gap-1">{timeAgo}</span>
          </div>

          <div className="mt-2 flex items-center gap-2 border-t border-gray-100 pt-3">
            <span className="text-sm text-gray-700">{product.seller_name}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
