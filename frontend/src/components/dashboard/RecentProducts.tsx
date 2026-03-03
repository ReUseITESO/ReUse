import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import ProductCard from '@/components/products/ProductCard';
import Skeleton from '@/components/ui/Skeleton';
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
              <Skeleton className="mb-3 h-44 w-full rounded-xl" />
              <Skeleton className="mb-2 h-4 w-20" />
              <Skeleton className="mb-2 h-5 w-full" />
              <Skeleton className="h-5 w-16" />
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
        <p className="py-8 text-center text-sm text-slate-500">
          No hay productos publicados todavia
        </p>
      )}
    </section>
  );
}
