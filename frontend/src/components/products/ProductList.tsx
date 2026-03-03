'use client';

import { useState } from 'react';

import SearchBar from '@/components/products/SearchBar';
import FilterBar from '@/components/products/FilterBar';
import SearchResultsBadge from '@/components/products/SearchResultsBadge';
import ProductCard from '@/components/products/ProductCard';
import Spinner from '@/components/ui/Spinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import EmptyState from '@/components/ui/EmptyState';

import { useProducts } from '@/hooks/useProducts';
import type { ProductFilters } from '@/hooks/useProducts';

export default function ProductList() {
    const {
        products, totalCount, currentPage, hasNextPage, hasPrevPage,
        isLoading, error, hasFilters, fetchProducts, goToPage,
    } = useProducts();

    // Search text and filter selects are tracked separately so each can reset
    // independently, but they are always merged into one API call.
    const [currentSearch, setCurrentSearch] = useState('');
    const [currentFilters, setCurrentFilters] = useState<Omit<ProductFilters, 'search'>>({});

    function handleSearch(query: string) {
        setCurrentSearch(query);
        fetchProducts({ ...currentFilters, search: query }); // resets to page 1
    }

    function handleFilterChange(filters: Omit<ProductFilters, 'search'>) {
        setCurrentFilters(filters);
        fetchProducts({ ...filters, search: currentSearch }); // resets to page 1
    }

    function handleShowAll() {
        setCurrentSearch('');
        setCurrentFilters({});
        fetchProducts();
    }

    return (
        <>
            <SearchBar onSearch={handleSearch} onShowAll={handleShowAll} />
            <FilterBar filters={currentFilters} onChange={handleFilterChange} />

            {hasFilters && (
                <SearchResultsBadge totalCount={totalCount} isLoading={isLoading} />
            )}

            <section className="mt-6">
                {isLoading && <Spinner />}

                {error && (
                    <ErrorMessage message={error} onRetry={() => fetchProducts()} />
                )}

                {!isLoading && !error && products.length === 0 && (
                    <EmptyState
                        message="No se encontraron productos"
                        actionLabel="Mostrar todos"
                        onAction={handleShowAll}
                    />
                )}

                {!isLoading && !error && products.length > 0 && (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {products.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}

                {/* ── Pagination ─────────────────────────────────────────── */}
                {!isLoading && !error && (hasNextPage || hasPrevPage) && (
                    <div className="mt-8 flex items-center justify-center gap-4">
                        <button
                            type="button"
                            disabled={!hasPrevPage}
                            onClick={() => goToPage(currentPage - 1)}
                            className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            ← Anterior
                        </button>

                        <span className="text-sm text-slate-500">
                            Página {currentPage} &nbsp;·&nbsp; {totalCount} productos
                        </span>

                        <button
                            type="button"
                            disabled={!hasNextPage}
                            onClick={() => goToPage(currentPage + 1)}
                            className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            Siguiente →
                        </button>
                    </div>
                )}
            </section>
        </>
    );
}
