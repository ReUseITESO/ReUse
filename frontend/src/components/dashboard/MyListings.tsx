'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

import ProductCard from '@/components/products/ProductCard';
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
  const router = useRouter();

  if (!isAuthenticated) return null;

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Mis publicaciones</h2>
        {totalCount > 3 && (
          <Link
            href="/profile"
            className="flex items-center gap-1 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700"
          >
            Ver todas ({totalCount})
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="mb-3 h-44 w-full animate-pulse rounded-lg bg-gray-200" />
              <div className="mb-2 h-4 w-20 animate-pulse rounded bg-gray-200" />
              <div className="mb-2 h-5 w-full animate-pulse rounded bg-gray-200" />
              <div className="h-5 w-16 animate-pulse rounded bg-gray-200" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && products.length === 0 && (
        <EmptyState
          message="Aún no has publicado nada"
          actionLabel="Publicar mi primer ítem"
          onAction={() => router.push('/products/new')}
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
