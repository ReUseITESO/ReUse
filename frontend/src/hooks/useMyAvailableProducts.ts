import { useCallback, useEffect, useState } from 'react';

import { apiClient } from '@/lib/api';

import { useAuth } from '@/hooks/useAuth';

import type { PaginatedResponse } from '@/types/api';
import type { Product } from '@/types/product';

const MAX_PAGES = 8;

export function useMyAvailableProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    if (!user?.id) {
      setProducts([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const merged: Product[] = [];
      for (let page = 1; page <= MAX_PAGES; page += 1) {
        const qs = new URLSearchParams({ seller: 'me', status: 'disponible' });
        if (page > 1) {
          qs.set('page', String(page));
        }

        const response = await apiClient<PaginatedResponse<Product>>(
          `/marketplace/products/?${qs.toString()}`,
        );

        merged.push(...response.results);
        if (!response.next) {
          break;
        }
      }

      setProducts(
        merged.filter(
          product => product.status === 'disponible' && !product.has_active_transaction,
        ),
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar tus artículos';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    isLoading,
    error,
    fetchProducts,
  };
}
