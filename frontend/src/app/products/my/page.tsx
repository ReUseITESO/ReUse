import Link from 'next/link';
import type { Metadata } from 'next';
import { ArrowLeft, PackagePlus, Shapes } from 'lucide-react';

import MyProductList from '@/components/products/MyProductList';

export const metadata: Metadata = {
  title: 'Mis artículos | ReUseITESO',
  description: 'Gestiona tus publicaciones en ReUseITESO',
};

export default function MyProductsPage() {
  return (
    <main className="space-y-6 px-4 py-8 sm:px-6">
      <Link
        href="/profile"
        className="inline-flex items-center gap-2 rounded-lg border border-input bg-card px-3 py-1.5 text-sm text-muted-fg transition-colors hover:bg-muted hover:text-fg"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a perfil
      </Link>

      <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-2">
              <Shapes className="h-5 w-5 text-secondary" />
              <h1 className="text-h1 font-bold text-fg">Mis artículos</h1>
            </div>
            <p className="text-sm text-muted-fg">
              Consulta el estado de tus publicaciones y edita las disponibles.
            </p>
          </div>

          <Link
            href="/products/new"
            className="inline-flex items-center gap-2 rounded-lg bg-btn-primary px-4 py-2.5 text-sm font-medium text-btn-primary-fg transition-colors hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-ring/20 focus:ring-offset-2"
          >
            <PackagePlus className="h-4 w-4" />
            Publicar artículo
          </Link>
        </div>
      </div>

      <MyProductList />
    </main>
  );
}
