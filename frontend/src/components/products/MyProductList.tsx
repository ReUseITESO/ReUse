'use client';

import MyProductCard from '@/components/products/MyProductCard';
import Spinner from '@/components/ui/Spinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import EmptyState from '@/components/ui/EmptyState';

import { useAuth } from '@/hooks/useAuth';
import { useMyProducts } from '@/hooks/useMyProducts';

export default function MyProductList() {
  const { isAuthenticated } = useAuth();

  const {
    products,
    totalCount,
    currentPage,
    hasNextPage,
    hasPrevPage,
    isLoading,
    error,
    fetchMyProducts,
    goToPage,
  } = useMyProducts();

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-md rounded-lg border border-warning/20 bg-warning/5 p-8 text-center">
        <p className="text-body font-medium text-fg">Selecciona un usuario</p>
        <p className="mt-2 text-sm text-warning">
          Usa el selector en la parte superior para elegir un usuario y ver tus articulos.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return <Spinner />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={() => fetchMyProducts()} />;
  }

  if (products.length === 0) {
    return (
      <EmptyState
        message="No se ha registrado ningun articulo o producto"
        actionLabel="Publicar artículo"
        onAction={() => {
          window.location.href = '/products/new';
        }}
      />
    );
  }

  return (
    <section>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map(product => (
          <MyProductCard
            key={product.id}
            product={product}
            onProductChanged={() => fetchMyProducts(currentPage)}
          />
        ))}
      </div>

      {(hasNextPage || hasPrevPage) && (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            type="button"
            disabled={!hasPrevPage}
            onClick={() => goToPage(currentPage - 1)}
            className="rounded-lg border border-input px-4 py-2 text-sm text-fg transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            Anterior
          </button>

          <span className="text-sm text-muted-fg">
            Pagina {currentPage} · {totalCount} productos
          </span>

          <button
            type="button"
            disabled={!hasNextPage}
            onClick={() => goToPage(currentPage + 1)}
            className="rounded-lg border border-input px-4 py-2 text-sm text-fg transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            Siguiente
          </button>
        </div>
      )}
    </section>
  );
}
