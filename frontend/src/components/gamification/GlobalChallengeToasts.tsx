'use client';

import { useEffect, useRef, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { Challenge, UserChallenge } from '@/types/gamification';

type ToastType = 'progress' | 'completed';

interface ChallengeToast {
  id: number;
  text: string;
  type: ToastType;
}

export default function GlobalChallengeToasts() {
  const { isAuthenticated } = useAuth();
  const [toasts, setToasts] = useState<ChallengeToast[]>([]);
  const previousProgressRef = useRef<Record<number, { progress: number; is_completed: boolean }>>(
    {},
  );
  const hydratedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) {
      hydratedRef.current = false;
      previousProgressRef.current = {};
      setToasts([]);
      return;
    }

    let disposed = false;

    const syncChallengeProgress = async () => {
      try {
        const [activeChallenges, myChallenges] = await Promise.all([
          apiClient<Challenge[]>('/gamification/challenges/'),
          apiClient<UserChallenge[]>('/gamification/challenges/me/'),
        ]);

        if (disposed) {
          return;
        }

        // Only notify for challenges currently active/visible in the active catalog.
        const activeIds = new Set(activeChallenges.map(item => item.id));
        const activeMyChallenges = myChallenges.filter(item => activeIds.has(item.challenge_id));

        const nextSnapshot: Record<number, { progress: number; is_completed: boolean }> = {};
        activeMyChallenges.forEach(item => {
          nextSnapshot[item.challenge_id] = {
            progress: item.progress,
            is_completed: item.is_completed,
          };
        });

        if (!hydratedRef.current) {
          previousProgressRef.current = nextSnapshot;
          hydratedRef.current = true;
          return;
        }

        const detectedToasts: ChallengeToast[] = [];

        activeMyChallenges.forEach(item => {
          const previous = previousProgressRef.current[item.challenge_id];
          if (!previous) {
            return;
          }

          const progressed = item.progress > previous.progress;
          const justCompleted = item.is_completed && !previous.is_completed;

          if (!progressed && !justCompleted) {
            return;
          }

          if (justCompleted) {
            window.dispatchEvent(new CustomEvent('reuse:points-updated'));
            detectedToasts.push({
              id: Date.now() + item.challenge_id,
              type: 'completed',
              text: `Reto completado: ${item.title}`,
            });
            return;
          }

          detectedToasts.push({
            id: Date.now() + item.challenge_id,
            type: 'progress',
            text: `Avanzaste en: ${item.title} (${item.progress}/${item.goal})`,
          });
        });

        if (detectedToasts.length > 0) {
          const limited = detectedToasts.slice(0, 2);
          setToasts(previous => [...previous, ...limited]);

          limited.forEach(toastItem => {
            window.setTimeout(() => {
              if (disposed) {
                return;
              }
              setToasts(previous => previous.filter(current => current.id !== toastItem.id));
            }, 4000);
          });
        }

        previousProgressRef.current = nextSnapshot;
      } catch {
        // Silent fail: toasts are non-critical UI feedback.
      }
    };

    syncChallengeProgress();
    const interval = window.setInterval(syncChallengeProgress, 8000);

    return () => {
      disposed = true;
      window.clearInterval(interval);
    };
  }, [isAuthenticated]);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed right-4 top-16 z-50 flex w-full max-w-sm flex-col gap-2">
      {toasts.map(toastItem => (
        <div
          key={toastItem.id}
          className={cn(
            'rounded-xl border px-3 py-2 text-sm shadow-md backdrop-blur-sm',
            toastItem.type === 'completed'
              ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
              : 'border-cyan-300 bg-cyan-50 text-cyan-800',
          )}
        >
          {toastItem.text}
        </div>
      ))}
    </div>
  );
}
