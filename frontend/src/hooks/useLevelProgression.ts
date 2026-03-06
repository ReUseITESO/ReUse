'use client';

import { useCallback, useEffect, useState } from 'react';

import { apiClient } from '@/lib/api';
import type { LevelProgression } from '@/types/gamification';

export function useLevelProgression() {
  const [data, setData] = useState<LevelProgression | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLevelProgression = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient<LevelProgression>('/gamification/level-progression/');
      setData(response);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo cargar la progresion de nivel';
      setError(message);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLevelProgression();
  }, [fetchLevelProgression]);

  return {
    levelProgression: data,
    isLoading,
    error,
    refetch: fetchLevelProgression,
  };
}