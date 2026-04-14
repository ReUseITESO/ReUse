'use client';

import { useCallback, useEffect, useState } from 'react';

import { apiClient } from '@/lib/api';
import type { BadgeWithStatus } from '@/types/gamification';

export function useBadgesStatus(enabled: boolean = true) {
  const [badges, setBadges] = useState<BadgeWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBadges = useCallback(async () => {
    if (!enabled) {
      setBadges([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await apiClient<BadgeWithStatus[]>('/gamification/badges/status/');
      setBadges(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudieron cargar las medallas';
      setError(message);
      setBadges([]);
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchBadges();
  }, [fetchBadges]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const onPointsUpdated = () => {
      fetchBadges();
    };

    window.addEventListener('reuse:points-updated', onPointsUpdated as EventListener);

    return () => {
      window.removeEventListener('reuse:points-updated', onPointsUpdated as EventListener);
    };
  }, [enabled, fetchBadges]);

  return {
    badges,
    isLoading,
    error,
    refetch: fetchBadges,
  };
}
