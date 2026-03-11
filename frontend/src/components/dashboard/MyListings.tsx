import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import ProductCard from '@/components/products/ProductCard';

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
            href="/products/my"
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
              <div className="mb-3 h-44 w-full animate-pulse rounded-xl bg-slate-200" />
              <div className="mb-2 h-4 w-20 animate-pulse rounded bg-slate-200" />
              <div className="mb-2 h-5 w-full animate-pulse rounded bg-slate-200" />
              <div className="h-5 w-16 animate-pulse rounded bg-slate-200" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && products.length === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <p className="text-sm text-slate-500">Aun no has publicado nada</p>
          <Link
            href="/products/new"
            className="rounded-xl bg-iteso-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-iteso-700"
          >
            Publicar mi primer item
          </Link>
        </div>
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
