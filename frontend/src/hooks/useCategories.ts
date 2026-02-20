import { useEffect, useState } from 'react';

import { apiClient } from '@/lib/api';

import type { Category } from '@/types/product';
import type { PaginatedResponse } from '@/types/api';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    apiClient<PaginatedResponse<Category>>('/marketplace/categories/')
      .then((data) => setCategories(data.results))
      .catch(() => setCategories([]))
      .finally(() => setIsLoading(false));
  }, []);

  return { categories, isLoading };
}
