import type { Metadata } from 'next';
import ProductDetail from '@/components/products/ProductDetail';

export const metadata: Metadata = {
  title: 'Detalle del producto | ReUseITESO',
};

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  return (
    <main className="p-8">
      <ProductDetail productId={params.id} />
    </main>
  );
}
