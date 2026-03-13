import { useCallback, useState } from 'react';

import { apiClient } from '@/lib/api';

import type { Product, ProductUpdatePayload } from '@/types/product';

export function useUpdateProduct() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProduct = useCallback(
    async (productId: number, payload: ProductUpdatePayload): Promise<Product | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const product = await apiClient<Product>(`/marketplace/products/${productId}/`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        return product;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al actualizar el producto';
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return { updateProduct, isLoading, error };
}
