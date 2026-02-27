import Link from 'next/link';

import ProductForm from '@/components/products/ProductForm';

export default function NewProductPage() {
  return (
    <main className="px-6 py-8">
      <div className="mb-8">
        <Link
          href="/products"
          className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-700"
        >
          &larr; Volver a productos
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Publicar artículo</h1>
      </div>
      <ProductForm />
    </main>
  );
}
