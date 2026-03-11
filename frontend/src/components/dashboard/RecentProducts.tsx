import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import ProductCard from '@/components/products/ProductCard';

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
        <h2 className="text-lg font-semibold text-slate-900">Lo mas reciente</h2>
        <Link
          href="/products"
          className="flex items-center gap-1 text-sm font-medium text-iteso-600 transition-colors hover:text-iteso-700"
        >
          Ver todos
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="mb-3 h-44 w-full animate-pulse rounded-xl bg-slate-200" />
              <div className="mb-2 h-4 w-20 animate-pulse rounded bg-slate-200" />
              <div className="mb-2 h-5 w-full animate-pulse rounded bg-slate-200" />
              <div className="h-5 w-16 animate-pulse rounded bg-slate-200" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={onRetry}
            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      )}

      {!isLoading && !error && products.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {!isLoading && !error && products.length === 0 && (
        <p className="py-8 text-center text-sm text-slate-500">
          No hay productos publicados todavia
        </p>
      )}
    </section>
  );
}
