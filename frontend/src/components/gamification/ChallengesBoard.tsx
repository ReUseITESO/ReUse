'use client';

import { useEffect, useMemo, useState } from 'react';
import { Award, Box, HandHeart, RefreshCw, Repeat2, Star } from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { useChallenges } from '@/hooks/useChallenges';
import { cn } from '@/lib/utils';
import type { ChallengeType, UserChallenge } from '@/types/gamification';

type ChallengeBucket = 'daily' | 'weekly' | 'monthly';

function getProgressForChallenge(challengeId: number, myChallenges: UserChallenge[]) {
  return myChallenges.find(item => item.challenge_id === challengeId);
}

function getChallengeIcon(type: ChallengeType) {
  if (type === 'donation') return HandHeart;
  if (type === 'exchange') return Repeat2;
  if (type === 'sale') return Award;
  if (type === 'publish') return Box;
  return Star;
}

function getChallengeTheme(type: ChallengeType) {
  if (type === 'donation') {
    return {
      badge: 'bg-emerald-500/15 text-emerald-800 ring-emerald-500/25 dark:text-emerald-200',
      accent: 'from-emerald-500 via-lime-400 to-teal-400',
      soft: 'bg-emerald-500/8',
      glow: 'shadow-emerald-500/15',
    };
  }
  if (type === 'exchange') {
    return {
      badge: 'bg-cyan-500/15 text-cyan-800 ring-cyan-500/25 dark:text-cyan-200',
      accent: 'from-cyan-500 via-sky-400 to-emerald-400',
      soft: 'bg-cyan-500/8',
      glow: 'shadow-cyan-500/15',
    };
  }
  if (type === 'sale') {
    return {
      badge: 'bg-orange-500/15 text-orange-800 ring-orange-500/25 dark:text-orange-200',
      accent: 'from-orange-500 via-amber-400 to-yellow-300',
      soft: 'bg-orange-500/8',
      glow: 'shadow-orange-500/15',
    };
  }
  if (type === 'publish') {
    return {
      badge: 'bg-violet-500/15 text-violet-800 ring-violet-500/25 dark:text-violet-200',
      accent: 'from-violet-500 via-fuchsia-400 to-pink-400',
      soft: 'bg-violet-500/8',
      glow: 'shadow-violet-500/15',
    };
  }
  return {
    badge: 'bg-yellow-500/15 text-yellow-900 ring-yellow-500/25 dark:text-yellow-200',
    accent: 'from-yellow-500 via-amber-400 to-orange-300',
    soft: 'bg-yellow-500/8',
    glow: 'shadow-yellow-500/15',
  };
}

function getBucketFromDates(startDate: string, endDate: string): ChallengeBucket {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  const durationDays = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));

  if (durationDays <= 2) return 'daily';
  if (durationDays <= 10) return 'weekly';
  return 'monthly';
}

function getProgressTone(progress: number, completed: boolean) {
  if (completed || progress >= 100) {
    return 'from-emerald-500 to-lime-400';
  }
  if (progress >= 60) {
    return 'from-cyan-500 to-emerald-400';
  }
  return 'from-orange-500 to-amber-400';
}

interface ChallengesBoardProps {
  refreshTrigger?: number;
}

export default function ChallengesBoard({ refreshTrigger = 0 }: ChallengesBoardProps) {
  const { isAuthenticated } = useAuth();
  const { challenges, myChallenges, isLoading, error, claimChallengeReward, refetch } =
    useChallenges(isAuthenticated, refreshTrigger);
  const [message, setMessage] = useState<string | null>(null);
  const [isErrorMessage, setIsErrorMessage] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [claimingId, setClaimingId] = useState<number | null>(null);
  const [clockTick, setClockTick] = useState(Date.now());
  const [activeBucket, setActiveBucket] = useState<ChallengeBucket>('daily');

  const challengesByBucket = useMemo(() => {
    const grouped: Record<ChallengeBucket, typeof challenges> = {
      daily: [],
      weekly: [],
      monthly: [],
    };

    challenges.forEach(challenge => {
      grouped[getBucketFromDates(challenge.start_date, challenge.end_date)].push(challenge);
    });

    return grouped;
  }, [challenges]);

  const visibleChallenges = challengesByBucket[activeBucket];

  useEffect(() => {
    const interval = window.setInterval(() => {
      setClockTick(Date.now());
    }, 60_000);

    return () => window.clearInterval(interval);
  }, []);

  const handleClaimReward = async (challengeId: number) => {
    if (claimingId === challengeId) {
      return;
    }

    setClaimingId(challengeId);
    setMessage(null);
    setIsErrorMessage(false);
    try {
      await claimChallengeReward(challengeId);
      window.dispatchEvent(new CustomEvent('reuse:points-updated'));
      setMessage('Recompensa reclamada.');
    } catch (err) {
      setIsErrorMessage(true);
      setMessage(err instanceof Error ? err.message : 'No se pudo reclamar la recompensa.');
    } finally {
      setClaimingId(null);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setMessage(null);
    setIsErrorMessage(false);

    try {
      await refetch();
      setMessage('Progreso actualizado correctamente.');
    } catch (err) {
      setIsErrorMessage(true);
      setMessage(err instanceof Error ? err.message : 'No se pudo actualizar el progreso.');
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <section className="rounded-2xl border border-warning/30 bg-warning/5 p-5">
        <h3 className="text-base font-semibold text-fg">Retos</h3>
        <p className="mt-1 text-sm text-muted-fg">
          Inicia sesión para ver y participar en retos activos.
        </p>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="rounded-3xl border border-border bg-card p-5 shadow-sm">
        <h3 className="text-base font-semibold text-fg">Retos</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <div className="h-64 animate-pulse rounded-3xl bg-muted" />
          <div className="h-64 animate-pulse rounded-3xl bg-muted" />
          <div className="h-64 animate-pulse rounded-3xl bg-muted" />
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-fg">Retos de ahora</h3>
          <p className="text-sm text-muted-fg">Cambia entre diarios, semanales y mensuales.</p>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-fg transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
          {isRefreshing ? 'Actualizando...' : 'Actualizar retos'}
        </button>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-muted p-1.5">
        <button
          type="button"
          onClick={() => setActiveBucket('daily')}
          className={cn(
            'rounded-xl px-3 py-2 text-sm font-semibold transition-colors',
            activeBucket === 'daily' ? 'bg-card text-fg shadow-sm' : 'text-muted-fg hover:text-fg',
          )}
        >
          Diarios ({challengesByBucket.daily.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveBucket('weekly')}
          className={cn(
            'rounded-xl px-3 py-2 text-sm font-semibold transition-colors',
            activeBucket === 'weekly' ? 'bg-card text-fg shadow-sm' : 'text-muted-fg hover:text-fg',
          )}
        >
          Semanales ({challengesByBucket.weekly.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveBucket('monthly')}
          className={cn(
            'rounded-xl px-3 py-2 text-sm font-semibold transition-colors',
            activeBucket === 'monthly'
              ? 'bg-card text-fg shadow-sm'
              : 'text-muted-fg hover:text-fg',
          )}
        >
          Mensuales ({challengesByBucket.monthly.length})
        </button>
      </div>

      {message ? (
        <p className={cn('mt-3 text-sm', isErrorMessage ? 'text-error' : 'text-emerald-700')}>
          {message}
        </p>
      ) : null}

      {error ? (
        <div className="mt-4 rounded-2xl border border-error/30 bg-error/5 p-3">
          <p className="text-sm text-error">{error}</p>
        </div>
      ) : null}

      {visibleChallenges.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-border bg-muted/40 p-8 text-center">
          <p className="mt-3 text-base font-semibold text-fg">
            No hay retos activos en esta categoría
          </p>
          <p className="mt-1 text-sm text-muted-fg">Prueba otra pestaña o vuelve más tarde.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {visibleChallenges.map(challenge => {
            const progress = getProgressForChallenge(challenge.id, myChallenges);
            const currentValue = progress ? progress.progress : 0;
            const normalizedProgress = Math.min(
              100,
              Math.round((currentValue / challenge.goal) * 100),
            );
            const isCompleted = progress?.is_completed ?? false;
            const isClaimed = progress?.reward_claimed ?? false;
            const theme = getChallengeTheme(challenge.challenge_type);
            const ChallengeIcon = getChallengeIcon(challenge.challenge_type);
            const daysRemaining = Math.ceil(
              (new Date(challenge.end_date).getTime() - clockTick) / (1000 * 60 * 60 * 24),
            );

            return (
              <article
                key={challenge.id}
                className={cn(
                  'group flex items-start gap-4 rounded-2xl border border-border bg-white p-4 shadow-sm transition-all hover:shadow-md',
                  isCompleted && 'border-emerald-200 bg-emerald-50/30',
                )}
              >
                <div
                  className={cn('rounded-2xl p-2.5 text-white flex-shrink-0 h-fit', theme.accent)}
                >
                  <ChallengeIcon className="h-5 w-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex-1">
                      <h4 className="font-semibold text-fg line-clamp-1">{challenge.title}</h4>
                      <p className="text-xs text-muted-fg mt-0.5">{daysRemaining} días restantes</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-base text-fg">{normalizedProgress}%</p>
                    </div>
                  </div>

                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn(
                        'h-2 rounded-full bg-gradient-to-r transition-all duration-500',
                        getProgressTone(normalizedProgress, isCompleted),
                      )}
                      style={{ width: `${normalizedProgress}%` }}
                    />
                  </div>

                  <div className="mt-2 flex items-center justify-between gap-2 text-xs text-muted-fg">
                    <span>
                      {Math.min(currentValue, challenge.goal)} / {challenge.goal}
                    </span>
                    <button
                      type="button"
                      onClick={async () => {
                        if (isCompleted && !isClaimed) {
                          await handleClaimReward(challenge.id);
                          return;
                        }
                      }}
                      disabled={isClaimed || !isCompleted || claimingId === challenge.id}
                      className={cn(
                        'px-3 py-1 rounded-lg text-xs font-semibold transition-all',
                        isClaimed
                          ? 'bg-muted text-muted-fg'
                          : isCompleted
                            ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                            : 'bg-muted text-muted-fg',
                        claimingId === challenge.id && 'opacity-70',
                      )}
                    >
                      {isClaimed
                        ? '✓ Reclamado'
                        : claimingId === challenge.id
                          ? 'Reclamando...'
                          : isCompleted
                            ? 'Reclamar'
                            : 'En progreso'}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
