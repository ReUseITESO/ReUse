import Link from 'next/link';
import { ArrowLeft, PencilLine } from 'lucide-react';

import ProductEditForm from '@/components/products/forms/ProductEditForm';

export default function EditProductPage({ params }: { params: { id: string } }) {
  return (
    <main className="space-y-6 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-2xl space-y-3">
        <Link
          href="/products/my"
          className="inline-flex items-center gap-2 rounded-lg border border-input bg-card px-3 py-1.5 text-sm text-muted-fg transition-colors hover:bg-muted hover:text-fg"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a mis artículos
        </Link>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-2">
            <PencilLine className="h-5 w-5 text-info" />
            <h1 className="text-h1 font-bold text-fg">Editar artículo</h1>
          </div>
          <p className="text-sm text-muted-fg">
            Actualiza datos, tipo de publicación e imagen del artículo.
          </p>
        </div>
      </div>
      <ProductEditForm productId={Number(params.id)} />
    </main>
  );
}
