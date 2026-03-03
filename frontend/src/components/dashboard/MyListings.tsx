import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import ProductCard from '@/components/products/ProductCard';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';

import type { Product } from '@/types/product';

interface MyListingsProps {
  products: Product[];
  totalCount: number;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export default function MyListings({
  products,
  totalCount,
  isLoading,
  isAuthenticated,
}: MyListingsProps) {
  if (!isAuthenticated) return null;

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Mis publicaciones</h2>
        {totalCount > 3 && (
          <Link
            href="/products?mine=true"
            className="flex items-center gap-1 text-sm font-medium text-iteso-600 transition-colors hover:text-iteso-700"
          >
            Ver todas ({totalCount})
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4">
              <Skeleton className="mb-3 h-44 w-full rounded-xl" />
              <Skeleton className="mb-2 h-4 w-20" />
              <Skeleton className="mb-2 h-5 w-full" />
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && products.length === 0 && (
        <EmptyState
          message="Aun no has publicado nada"
          actionLabel="Publicar mi primer item"
          onAction={() => (window.location.href = '/products/new')}
        />
      )}

      {!isLoading && products.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
