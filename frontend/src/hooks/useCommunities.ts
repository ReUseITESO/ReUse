'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import type { Community } from '@/types/community';

export function useCommunities() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient<{ results: Community[] } | Community[]>(
        '/social/communities/',
      );
      const results = Array.isArray(data) ? data : data.results ?? [];
      setCommunities(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar comunidades');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  async function createCommunity(name: string, description: string): Promise<string | null> {
    try {
      await apiClient('/social/communities/', {
        method: 'POST',
        body: JSON.stringify({ name, description }),
      });
      await fetch();
      return null;
    } catch (err) {
      return err instanceof Error ? err.message : 'Error al crear';
    }
  }

  return { communities, isLoading, error, refresh: fetch, createCommunity };
}
