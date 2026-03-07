import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import ProductCard from '@/components/products/ProductCard';
import ErrorMessage from '@/components/ui/ErrorMessage';

import type { Product } from '@/types/product';

interface RecentProductsProps {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

export default function RecentProducts({
  products,
  isLoading,
  error,
  onRetry,
}: RecentProductsProps) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Lo más reciente</h2>
        <Link
          href="/products"
          className="flex items-center gap-1 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
        >
          Ver todos
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="mb-3 h-44 w-full animate-pulse rounded-lg bg-gray-200" />
              <div className="mb-2 h-4 w-20 animate-pulse rounded bg-gray-200" />
              <div className="mb-2 h-5 w-full animate-pulse rounded bg-gray-200" />
              <div className="h-5 w-16 animate-pulse rounded bg-gray-200" />
            </div>
          ))}
        </div>
      )}

      {error && <ErrorMessage message={error} onRetry={onRetry} />}

      {!isLoading && !error && products.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {!isLoading && !error && products.length === 0 && (
        <p className="py-8 text-center text-sm text-gray-500">
          No hay productos publicados todavía
        </p>
      )}
    </section>
  );
}
