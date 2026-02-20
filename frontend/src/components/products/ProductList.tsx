'use client';

import SearchBar from '@/components/products/SearchBar';
import SearchResultsBadge from '@/components/products/SearchResultsBadge';
import ProductCard from '@/components/products/ProductCard';
import Spinner from '@/components/ui/Spinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import EmptyState from '@/components/ui/EmptyState';

import { useProducts } from '@/hooks/useProducts';

export default function ProductList() {
    const { products, totalCount, isLoading, error, hasSearched, fetchProducts } = useProducts();

    function handleSearch(query: string) {
        fetchProducts(query);
    }

    function handleShowAll() {
        fetchProducts();
    }

    return (
        <>
            <SearchBar onSearch={handleSearch} onShowAll={handleShowAll} />

            {hasSearched && (
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
            </section>
        </>
    );
}
