'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, ListFilter } from 'lucide-react';

import SearchBar from '@/components/products/SearchBar';
import FilterBar from '@/components/products/FilterBar';
import SearchResultsBadge from '@/components/products/SearchResultsBadge';
import ProductCard from '@/components/products/ProductCard';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import EmptyState from '@/components/ui/EmptyState';

import { useProducts } from '@/hooks/useProducts';
import type { ProductFilters } from '@/hooks/useProducts';

export default function ProductList() {
  const {
    products,
    totalCount,
    currentPage,
    hasNextPage,
    hasPrevPage,
    isLoading,
    error,
    hasFilters,
    fetchProducts,
    goToPage,
  } = useProducts();

  const [currentSearch, setCurrentSearch] = useState('');
  const [currentFilters, setCurrentFilters] = useState<Omit<ProductFilters, 'search'>>({});

  function handleSearch() {
    fetchProducts({ ...currentFilters, search: currentSearch.trim() });
  }

  function handleFilterChange(filters: Omit<ProductFilters, 'search'>) {
    setCurrentFilters(filters);
    fetchProducts({ ...filters, search: currentSearch.trim() });
  }

  function handleShowAll() {
    setCurrentSearch('');
    setCurrentFilters({});
    fetchProducts();
  }

  return (
    <>
      <section className="rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-card to-secondary/5 p-4 shadow-sm">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-fg">
          <ListFilter className="h-4 w-4 text-info" />
          Buscar y filtrar marketplace
        </span>

        <div className="mt-4">
          <SearchBar
            query={currentSearch}
            onQueryChange={setCurrentSearch}
            onSearch={() => handleSearch()}
            onShowAll={handleShowAll}
            showContainer={false}
            showShowAllButton={hasFilters}
          />
        </div>

        <FilterBar filters={currentFilters} onChange={handleFilterChange} showContainer={false} />
      </section>

      <SearchResultsBadge totalCount={totalCount} isLoading={isLoading} hasFilters={hasFilters} />

      <section className="mt-6">
        {isLoading && <Spinner />}

        {error && <ErrorMessage message={error} onRetry={() => fetchProducts()} />}

        {!isLoading && !error && products.length === 0 && (
          <EmptyState
            message={
              hasFilters
                ? 'No se encontraron productos con esos filtros'
                : 'No se ha registrado ningun articulo o producto'
            }
            actionLabel={hasFilters ? 'Mostrar todos' : undefined}
            onAction={hasFilters ? handleShowAll : undefined}
          />
        )}

        {!isLoading && !error && products.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {!isLoading && !error && (hasNextPage || hasPrevPage) && (
          <div className="mt-8 flex items-center justify-center gap-4">
            <Button
              type="button"
              variant="template"
              disabled={!hasPrevPage}
              onClick={() => goToPage(currentPage - 1)}
              className="inline-flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>

            <span className="text-sm text-muted-fg">
              Página {currentPage} &nbsp;·&nbsp; {totalCount} productos
            </span>

            <Button
              type="button"
              variant="template"
              disabled={!hasNextPage}
              onClick={() => goToPage(currentPage + 1)}
              className="inline-flex items-center gap-2"
            >
              Siguiente →
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </section>
    </>
  );
}
