import type { Metadata } from 'next';

import ProductList from '@/components/products/ProductList';

export const metadata: Metadata = {
  title: 'Productos disponibles | ReUseITESO',
  description: 'Explora productos de segunda mano disponibles entre estudiantes del ITESO',
};

export default function ProductsPage() {
  return (
    <main className="p-8">
      <h1 className="mb-6 text-2xl font-bold">Productos disponibles</h1>
      <ProductList />
    </main>
  );
}
