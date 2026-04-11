'use client';

import { useCallback, useEffect, useState } from 'react';

import { apiClient } from '@/lib/api';
import type { Challenge, UserChallenge } from '@/types/gamification';

export function useChallenges(enabled: boolean = true, refreshTrigger: number = 0) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [myChallenges, setMyChallenges] = useState<UserChallenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChallenges = useCallback(async () => {
    if (!enabled) {
      setChallenges([]);
      setMyChallenges([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [active, mine] = await Promise.all([
        apiClient<Challenge[]>('/gamification/challenges/'),
        apiClient<UserChallenge[]>('/gamification/challenges/me/'),
      ]);
      setChallenges(active);
      setMyChallenges(mine);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('reuse:challenges-snapshot', {
            detail: { challenges: active, myChallenges: mine },
          }),
        );
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudieron cargar los retos';
      setError(message);
      setChallenges([]);
      setMyChallenges([]);
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  const claimChallengeReward = useCallback(
    async (challengeId: number) => {
      await apiClient<UserChallenge>(`/gamification/challenges/${challengeId}/claim/`, {
        method: 'POST',
      });
      await fetchChallenges();
    },
    [fetchChallenges],
  );
  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges, refreshTrigger]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const interval = window.setInterval(() => {
      fetchChallenges();
    }, 20_000);

    return () => window.clearInterval(interval);
  }, [enabled, fetchChallenges]);

  return {
    challenges,
    myChallenges,
    isLoading,
    error,
    claimChallengeReward,
    refetch: fetchChallenges,
  };
}
