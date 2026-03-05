import { useCallback, useEffect, useState } from 'react';

import { apiClient } from '@/lib/api';

import { useMockAuth } from '@/context/MockAuthContext';

import type { Product } from '@/types/product';
import type { PaginatedResponse } from '@/types/api';

export function useMyProducts() {
  const { currentUser } = useMockAuth();
  const userId = currentUser?.id;
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMyProducts = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams({ seller: 'me' });
    if (page > 1) params.set('page', String(page));

    try {
      const data = await apiClient<PaginatedResponse<Product>>(
        `/marketplace/products/?${params.toString()}`,
      );
      setProducts(data.results);
      setTotalCount(data.count);
      setCurrentPage(page);
      setHasNextPage(Boolean(data.next));
      setHasPrevPage(Boolean(data.previous));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error al cargar tus productos';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const goToPage = useCallback(
    (page: number) => {
      fetchMyProducts(page);
    },
    [fetchMyProducts],
  );

  useEffect(() => {
    if (userId) {
      fetchMyProducts();
    } else {
      setProducts([]);
      setTotalCount(0);
    }
  }, [fetchMyProducts, userId]);

  return {
    products,
    totalCount,
    currentPage,
    hasNextPage,
    hasPrevPage,
    isLoading,
    error,
    fetchMyProducts,
    goToPage,
  };
}
