import { useCallback, useState } from 'react';

import { apiClient } from '@/lib/api';

import type { Product, ProductCreatePayload } from '@/types/product';

export function useCreateProduct() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProduct = useCallback(async (payload: ProductCreatePayload): Promise<Product | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const product = await apiClient<Product>('/marketplace/products/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return product;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error al crear el producto';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { createProduct, isLoading, error };
}
