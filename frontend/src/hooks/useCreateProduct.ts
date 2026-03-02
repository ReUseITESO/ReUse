import { useCallback, useState } from 'react';

import { apiClient } from '@/lib/api';

import type { Product, ProductCreatePayload } from '@/types/product';

export function useCreateProduct() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createProduct = useCallback(
    async (payload: ProductCreatePayload, images: File[] = []): Promise<Product | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const formData = new FormData();
        formData.append('title', payload.title);
        formData.append('description', payload.description);
        formData.append('condition', payload.condition);
        formData.append('transaction_type', payload.transaction_type);
        formData.append('category', String(payload.category));
        if (payload.price != null) {
          formData.append('price', String(payload.price));
        }
        images.forEach((img) => formData.append('images', img));

        const product = await apiClient<Product>('/marketplace/products/', {
          method: 'POST',
          body: formData,
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
    },
    [],
  );

  return { createProduct, isLoading, error };
}
