'use client';

import { useMemo, useState } from 'react';
import { Award, Box, CheckCircle2, HandHeart, Repeat2, Star } from 'lucide-react';

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
      accent: 'from-emerald-500 to-teal-500',
      row: 'border-emerald-300/70 bg-emerald-50/70',
    };
  }
  if (type === 'exchange') {
    return {
      accent: 'from-cyan-500 to-sky-500',
      row: 'border-cyan-300/70 bg-cyan-50/60',
    };
  }
  if (type === 'sale') {
    return {
      accent: 'from-orange-500 to-amber-500',
      row: 'border-orange-300/70 bg-orange-50/60',
    };
  }
  if (type === 'publish') {
    return {
      accent: 'from-violet-500 to-fuchsia-500',
      row: 'border-violet-300/70 bg-violet-50/60',
    };
  }
  return {
    accent: 'from-yellow-500 to-orange-500',
    row: 'border-yellow-300/70 bg-yellow-50/60',
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

function getDaysRemaining(bucket: ChallengeBucket, nowMs: number) {
  const now = new Date(nowMs);

  if (bucket === 'daily') {
    return 1;
  }

  if (bucket === 'weekly') {
    const day = now.getDay();
    const dayFromMonday = day === 0 ? 6 : day - 1;
    return Math.max(1, 7 - dayFromMonday);
  }

  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return Math.max(1, daysInMonth - now.getDate() + 1);
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
  const { challenges, myChallenges, isLoading, error, claimChallengeReward } = useChallenges(
    isAuthenticated,
    refreshTrigger,
  );
  const [message, setMessage] = useState<string | null>(null);
  const [isErrorMessage, setIsErrorMessage] = useState(false);
  const [claimingId, setClaimingId] = useState<number | null>(null);
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
          <h3 className="text-base font-semibold text-fg">Retos</h3>
        </div>
        <div className="flex items-center gap-2">
          <div className="grid grid-cols-3 gap-1 rounded-2xl bg-muted p-1">
            <button
              type="button"
              onClick={() => setActiveBucket('daily')}
              className={cn(
                'rounded-xl px-3 py-2 text-sm font-semibold transition-colors',
                activeBucket === 'daily'
                  ? 'bg-card text-fg shadow-sm'
                  : 'text-muted-fg hover:text-fg',
              )}
            >
              Diarios
            </button>
            <button
              type="button"
              onClick={() => setActiveBucket('weekly')}
              className={cn(
                'rounded-xl px-3 py-2 text-sm font-semibold transition-colors',
                activeBucket === 'weekly'
                  ? 'bg-card text-fg shadow-sm'
                  : 'text-muted-fg hover:text-fg',
              )}
            >
              Semanales
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
              Mensuales
            </button>
          </div>
        </div>
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
            const isClaimAction = isCompleted && !isClaimed;
            const statusLabel = isClaimed ? 'Reclamado' : isCompleted ? 'Reclamar' : 'En curso';

            return (
              <article
                key={challenge.id}
                className={cn(
                  'group flex items-center gap-4 rounded-2xl border border-border bg-white p-4 shadow-sm transition-all hover:shadow-md',
                  isCompleted && theme.row,
                )}
              >
                <div
                  className={cn(
                    'h-fit flex-shrink-0 rounded-2xl bg-gradient-to-br p-2.5 text-white shadow-sm',
                    theme.accent,
                  )}
                >
                  <ChallengeIcon className="h-5 w-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="mb-2 flex items-center gap-2">
                    <h4 className="line-clamp-1 font-semibold text-fg">{challenge.title}</h4>
                    {isCompleted ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : null}
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-muted">
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
                      completado
                    </span>
                    <span className="font-semibold text-primary">+{challenge.bonus_points} pts</span>
                  </div>
                </div>

                {isClaimAction ? (
                  <button
                    type="button"
                    onClick={async () => {
                      await handleClaimReward(challenge.id);
                    }}
                    disabled={claimingId === challenge.id}
                    className={cn(
                      'flex-shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition',
                      'bg-primary text-white hover:bg-primary-hover',
                      claimingId === challenge.id && 'opacity-70',
                    )}
                  >
                    {claimingId === challenge.id ? 'Reclamando...' : statusLabel}
                  </button>
                ) : (
                  <span className="flex-shrink-0 rounded-full bg-muted px-4 py-2 text-xs font-semibold text-muted-fg">
                    {statusLabel}
                  </span>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
