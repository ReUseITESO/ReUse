import { useCallback, useState } from 'react';
import { apiClient } from '@/lib/api';
import type { ChangeStatusResult, Product, ProductStatus } from '@/types/product';

export function useChangeProductStatus() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const changeStatus = useCallback(
    async (productId: number, status: ProductStatus): Promise<ChangeStatusResult> => {
      setIsLoading(true);
      setError(null);

      try {
        const product = await apiClient<Product>(`/marketplace/products/${productId}/status/`, {
          method: 'PATCH',
          body: JSON.stringify({ status }),
        });
        return { product, error: null };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al cambiar el estado';
        setError(message);
        return { product: null, error: message };
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return { changeStatus, isLoading, error };
}
