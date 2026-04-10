'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import type { Product } from '@/types/product';

interface CommunityMarketplaceResponse {
  count: number;
  pages: number;
  current_page: number;
  results: Product[];
}

export function useCommunityMarketplace(communityId: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient<CommunityMarketplaceResponse>(
        `/social/communities/${communityId}/products/`,
      );
      setProducts(data.results || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar productos');
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [communityId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { products, isLoading, error, refresh: fetch };
}
