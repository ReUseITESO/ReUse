import Link from 'next/link';
import ProductEditForm from '@/components/products/ProductEditForm';

export default function EditProductPage({ params }: { params: { id: string } }) {
  return (
    <main className="px-6 py-8">
      <div className="mb-8">
        <Link
          href="/products/my"
          className="text-sm font-medium text-muted-fg transition-colors hover:text-fg"
        >
          &larr; Volver a mis artículos
        </Link>
        <h1 className="mt-2 text-h2 font-bold text-fg">Editar artículo</h1>
      </div>
      <ProductEditForm productId={Number(params.id)} />
    </main>
  );
}
