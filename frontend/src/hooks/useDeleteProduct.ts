import { useCallback, useState } from 'react';

import { apiClient } from '@/lib/api';

export function useDeleteProduct() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteProduct = useCallback(async (productId: number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      await apiClient<null>(`/marketplace/products/${productId}/`, {
        method: 'DELETE',
      });
      return true;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error al eliminar el producto';
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { deleteProduct, isLoading, error };
}
