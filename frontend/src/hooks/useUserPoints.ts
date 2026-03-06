'use client';

import { useCallback, useEffect, useState } from 'react';

import { apiClient } from '@/lib/api';
import type { UserPoints } from '@/types/gamification';

export function useUserPoints(userId: number | null) {
  const [points, setPoints] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPoints = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      setError('Por favor selecciona un usuario del menú superior');
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
          message = 'Usuario no autenticado. Selecciona un usuario del menú.';
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
  }, [userId]);

  useEffect(() => {
    fetchPoints();
  }, [fetchPoints]);

  return { points, isLoading, error, refetch: fetchPoints };
}
