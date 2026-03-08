'use client';

import Link from 'next/link';

import ProductForm from '@/components/products/ProductForm';
import ProtectedRoute from '@/components/layout/ProtectedRoute';

export default function NewProductPage() {
  return (
    <ProtectedRoute>
      <main className="px-6 py-8">
        <div className="mb-8">
          <Link
            href="/products"
            className="text-sm font-medium text-muted-fg transition-colors hover:text-fg"
          >
            &larr; Volver a productos
          </Link>
          <h1 className="mt-2 text-h2 font-bold text-fg">Publicar artículo</h1>
        </div>
        <ProductForm />
      </main>
    </ProtectedRoute>
  );
}
