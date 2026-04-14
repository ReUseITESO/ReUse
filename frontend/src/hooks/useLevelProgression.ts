'use client';

import { useCallback, useEffect, useState } from 'react';

import { apiClient } from '@/lib/api';
import type { LevelProgression } from '@/types/gamification';

export function useLevelProgression(enabled: boolean = true, refreshTrigger: number = 0) {
  const [data, setData] = useState<LevelProgression | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLevelProgression = useCallback(async () => {
    if (!enabled) {
      setIsLoading(false);
      setError(null);
      setData(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient<LevelProgression>('/gamification/level-progression/');
      setData(response);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'No se pudo cargar la progresion de nivel';
      setError(message);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchLevelProgression();
  }, [fetchLevelProgression, refreshTrigger]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const onPointsUpdated = () => {
      fetchLevelProgression();
    };

    window.addEventListener('reuse:points-updated', onPointsUpdated as EventListener);

    return () => {
      window.removeEventListener('reuse:points-updated', onPointsUpdated as EventListener);
    };
  }, [enabled, fetchLevelProgression]);

  return {
    levelProgression: data,
    isLoading,
    error,
    refetch: fetchLevelProgression,
  };
}
