'use client';

import Link from 'next/link';

import ProductList from '@/components/products/ProductList';
import { useAuth } from '@/hooks/useAuth';

export default function ProductsPage() {
  const { isAuthenticated } = useAuth();

  return (
    <main className="px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-h2 font-bold text-fg">Productos disponibles</h1>
        {isAuthenticated && (
          <Link
            href="/products/new"
            className="inline-flex items-center gap-2 rounded-lg bg-btn-primary px-4 py-2.5 text-sm font-medium text-btn-primary-fg transition-colors hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-ring/20 focus:ring-offset-2"
          >
            <span aria-hidden="true">+</span>
            Publicar artículo
          </Link>
        )}
      </div>
      <ProductList/>
    </main>
  );
}
