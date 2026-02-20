import ProductList from '@/components/products/ProductList';

export default function ProductsPage() {
  return (
    <main className="p-8">
      <h1 className="mb-6 text-2xl font-bold">Productos disponibles</h1>
      <ProductList />
    </main>
  );
}
