import { useEffect, useState } from 'react';

import { apiClient } from '@/lib/api';

import type { Category } from '@/types/product';
import type { PaginatedResponse } from '@/types/api';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    apiClient<PaginatedResponse<Category>>('/marketplace/categories/')
      .then((data) => setCategories(data.results))
      .catch((err: unknown) => {
        const normalizedError =
          err instanceof Error ? err : new Error('Failed to load categories');
        setError(normalizedError);
        setCategories([]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return { categories, isLoading, error };
}
