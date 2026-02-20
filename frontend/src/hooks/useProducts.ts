import { useCallback, useEffect, useState } from 'react';

import { apiClient } from '@/lib/api';

import type { Product } from '@/types/product';
import type { PaginatedResponse } from '@/types/api';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchProducts = useCallback(async (search?: string) => {
    setIsLoading(true);
    setError(null);
    setHasSearched(Boolean(search));

    try {
      const query = search ? `?search=${encodeURIComponent(search)}` : '';
      const data = await apiClient<PaginatedResponse<Product>>(
        `/marketplace/products/${query}`,
      );
      setProducts(data.results);
      setTotalCount(data.count);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error loading products';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, totalCount, isLoading, error, hasSearched, fetchProducts };
}