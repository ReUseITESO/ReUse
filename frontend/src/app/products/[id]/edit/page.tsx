import Link from 'next/link';
import ProductEditForm from '@/components/products/ProductEditForm';

export default function EditProductPage({ params }: { params: { id: string } }) {
  return (
    <main className="px-6 py-8">
      <div className="mb-8">
        <Link
          href="/products/my"
          className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-700"
        >
          &larr; Volver a mis artículos
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Editar artículo</h1>
      </div>
      <ProductEditForm productId={Number(params.id)} />
    </main>
  );
}
