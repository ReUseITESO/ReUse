'use client';

import Link from 'next/link';
import { PackageOpen, PlusCircle } from 'lucide-react';

import ProductList from '@/components/products/ProductList';
import { useAuth } from '@/hooks/useAuth';

export default function ProductsPage() {
  const { isAuthenticated } = useAuth();

  return (
    <main className="space-y-6 px-4 py-8 sm:px-6">
      <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary">
              <PackageOpen className="h-5 w-5" />
            </span>
            <div>
              <h1 className="text-h1 font-bold text-fg">Productos disponibles</h1>
              <p className="text-sm text-muted-fg">
                Explora artículos publicados por la comunidad.
              </p>
            </div>
          </div>

          {isAuthenticated && (
            <Link
              href="/products/new"
              className="inline-flex items-center gap-2 rounded-lg bg-btn-primary px-4 py-2.5 text-sm font-medium text-btn-primary-fg transition-colors hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-ring/20 focus:ring-offset-2"
            >
              <PlusCircle className="h-4 w-4" />
              Publicar artículo
            </Link>
          )}
        </div>
      </div>

      <ProductList />
    </main>
  );
}
