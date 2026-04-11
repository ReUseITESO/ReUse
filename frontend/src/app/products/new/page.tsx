'use client';

import Link from 'next/link';
import { ArrowLeft, PackagePlus } from 'lucide-react';

import ProductForm from '@/components/products/forms/ProductForm';
import ProtectedRoute from '@/components/layout/ProtectedRoute';

export default function NewProductPage() {
  return (
    <ProtectedRoute>
      <main className="space-y-6 px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-2xl space-y-3">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-lg border border-input bg-card px-3 py-1.5 text-sm text-muted-fg transition-colors hover:bg-muted hover:text-fg"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a productos
          </Link>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-2">
              <PackagePlus className="h-5 w-5 text-primary" />
              <h1 className="text-h1 font-bold text-fg">Publicar artículo</h1>
            </div>
            <p className="text-sm text-muted-fg">
              Comparte artículos con fotos, tipo de transacción y categoría.
            </p>
          </div>
        </div>
        <ProductForm />
      </main>
    </ProtectedRoute>
  );
}
