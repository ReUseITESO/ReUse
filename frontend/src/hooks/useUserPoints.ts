'use client';

import { useCallback, useEffect, useState } from 'react';

import { apiClient } from '@/lib/api';
import type { UserPoints } from '@/types/gamification';

export function useUserPoints(enabled: boolean = true, refreshTrigger: number = 0) {
  const [points, setPoints] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPoints = useCallback(async () => {
    if (!enabled) {
      setIsLoading(false);
      setError(null);
      setPoints(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await apiClient<UserPoints>('/gamification/points/');
      setPoints(data.points);
    } catch (err) {
      let message = 'No se pudieron cargar los puntos';

      if (err instanceof Error) {
        if (err.message.includes('401')) {
          message = 'Usuario no autenticado. Inicia sesión para ver tus puntos.';
        } else if (err.message.includes('404')) {
          message = 'Usuario no encontrado en la base de datos.';
        } else {
          message = err.message;
        }
      }

      setError(message);
      setPoints(null);
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchPoints();
  }, [fetchPoints, refreshTrigger]);

  return { points, isLoading, error, refetch: fetchPoints };
}
