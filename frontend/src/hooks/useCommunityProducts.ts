'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import type { Product } from '@/types/product';

interface CommunityProductsResponse {
  count: number;
  pages: number;
  current_page: number;
  results: Product[];
}

export function useCommunityProducts(communityId?: number) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetch = useCallback(
    async (page = 1) => {
      setIsLoading(true);
      setError(null);
      try {
        // Use /marketplace/products/ with scope=communities for all community items
        // or with community={id} to filter by specific community
        const params = new URLSearchParams();
        
        if (communityId) {
          // Show items from specific community
          params.append('community', String(communityId));
        } else {
          // Show items from ALL user's joined communities
          params.append('scope', 'communities');
        }
        params.append('page', String(page));
        
        const url = `/marketplace/products/?${params.toString()}`;
        const data = await apiClient<CommunityProductsResponse>(url);
        setProducts(data.results || []);
        setTotalCount(data.count || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar productos de comunidad');
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    },
    [communityId],
  );

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { products, isLoading, error, totalCount, refresh: fetch };
}
