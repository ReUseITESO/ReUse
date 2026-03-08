import Link from 'next/link';
import type { Metadata } from 'next';

import MyProductList from '@/components/products/MyProductList';

export const metadata: Metadata = {
  title: 'Mis artículos | ReUseITESO',
  description: 'Gestiona tus publicaciones en ReUseITESO',
};

export default function MyProductsPage() {
  return (
    <main className="px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link
            href="/profile"
            className="text-sm font-medium text-muted-fg transition-colors hover:text-fg"
          >
            &larr; Volver a perfil
          </Link>
          <h1 className="mt-2 text-h2 font-bold text-fg">Mis artículos</h1>
        </div>
        <Link
          href="/products/new"
          className="inline-flex items-center gap-2 rounded-lg bg-btn-primary px-4 py-2.5 text-sm font-medium text-btn-primary-fg transition-colors hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-ring/20 focus:ring-offset-2"
        >
          <span aria-hidden="true">+</span>
          Publicar artículo
        </Link>
      </div>
      <MyProductList />
    </main>
  );
}
