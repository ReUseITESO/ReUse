'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';

type UserImpact = {
  items_reused: number;
  items_saved_from_waste: number;
  co2_avoided: number;
  community_average_items: number;
  community_average_co2: number;
};

export function useUserImpact(enabled: boolean = true, refreshTrigger: number = 0) {
  const [data, setData] = useState<UserImpact | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchImpact = useCallback(async () => {
    if (!enabled) {
      setIsLoading(false);
      setError(null);
      setData(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await apiClient<UserImpact>('/gamification/impact/');
      setData(result);
    } catch (err) {
      let message = 'No se pudo obtener el impacto ecológico';

      if (err instanceof Error) {
        if (err.message.includes('401')) {
          message = 'Usuario no autenticado. Inicia sesión.';
        } else if (err.message.includes('404')) {
          message = 'No se encontraron métricas de impacto.';
        } else {
          message = err.message;
        }
      }

      setError(message);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchImpact();
  }, [fetchImpact, refreshTrigger]);

  return { data, isLoading, error, refetch: fetchImpact };
}
