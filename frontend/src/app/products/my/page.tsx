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
            className="text-sm font-medium text-gray-500 transition-colors hover:text-gray-700"
          >
            &larr; Volver a perfil
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">Mis artículos</h1>
        </div>
        <Link
          href="/products/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:ring-offset-2"
        >
          <span aria-hidden="true">+</span>
          Publicar artículo
        </Link>
      </div>
      <MyProductList />
    </main>
  );
}
