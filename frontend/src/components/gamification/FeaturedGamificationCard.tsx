'use client';

import {
  AlertTriangle,
  BookOpen,
  Crown,
  Leaf,
  Medal,
  Sprout,
  Sparkles,
  Star,
  Trophy,
  Zap,
} from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { useBadgesStatus } from '@/hooks/useBadgesStatus';
import { useLevelProgression } from '@/hooks/useLevelProgression';
import { cn } from '@/lib/utils';

interface FeaturedGamificationCardProps {
  refreshTrigger?: number;
}

function getBadgeIcon(name: string, index: number) {
  const normalizedName = name.toLowerCase();

  if (normalizedName.includes('eco') || normalizedName.includes('ambiente')) {
    return <Sparkles className="h-4 w-4" />;
  }

  if (normalizedName.includes('estrella') || normalizedName.includes('top')) {
    return <Star className="h-4 w-4" />;
  }

  if (normalizedName.includes('venta') || normalizedName.includes('trueque')) {
    return <Zap className="h-4 w-4" />;
  }

  if (index === 0) {
    return <Trophy className="h-4 w-4" />;
  }

  return <Medal className="h-4 w-4" />;
}

function getLevelIcon(iconName: string, levelName: string) {
  const normalizedIcon = iconName.toLowerCase();
  const normalizedName = levelName.toLowerCase();

  if (normalizedIcon.includes('seed') || normalizedName.includes('beginner')) {
    return Sprout;
  }

  if (normalizedIcon.includes('leaf') || normalizedName.includes('active')) {
    return Leaf;
  }

  if (normalizedIcon.includes('trophy') || normalizedName.includes('champion')) {
    return Trophy;
  }

  if (normalizedIcon.includes('crown') || normalizedName.includes('leader')) {
    return Crown;
  }

  if (normalizedIcon.includes('book')) {
    return BookOpen;
  }

  return Trophy;
}

export default function FeaturedGamificationCard({
  refreshTrigger = 0,
}: FeaturedGamificationCardProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    levelProgression,
    isLoading: levelLoading,
    error: levelError,
    refetch: refetchLevel,
  } = useLevelProgression(isAuthenticated, refreshTrigger);
  const { badges, isLoading: badgesLoading } = useBadgesStatus(isAuthenticated);

  const isInitialLoading = authLoading || (levelLoading && !levelProgression && !levelError);

  if (isInitialLoading) {
    return (
      <article className="h-full min-h-[320px] animate-pulse rounded-2xl border border-border bg-card p-6" />
    );
  }

  if (!isAuthenticated) {
    return (
      <article className="rounded-2xl border border-yellow-200 bg-yellow-50 p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 text-yellow-700" />
          <div>
            <p className="text-sm font-medium text-yellow-900">Usuario no autenticado</p>
            <p className="mt-1 text-xs text-yellow-700">
              Inicia sesion para ver tu nivel de gamificacion
            </p>
          </div>
        </div>
      </article>
    );
  }

  if (levelError) {
    return (
      <article className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <p className="text-sm font-medium text-red-700">{levelError}</p>
        <button
          onClick={refetchLevel}
          className={cn(
            'mt-3 rounded-md px-4 py-2 text-sm font-medium',
            'bg-red-100 text-red-700',
            'transition-colors hover:bg-red-200',
            'focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
          )}
        >
          Reintentar
        </button>
      </article>
    );
  }

  if (!levelProgression) {
    return null;
  }

  const normalizedProgress = Math.max(0, Math.min(100, levelProgression.progress_percent || 0));
  const currentPoints = levelProgression.points || 0;
  const nextLevelTarget =
    levelProgression.next_level?.min_points ??
    currentPoints + levelProgression.points_to_next_level;
  const CurrentLevelIcon = getLevelIcon(
    levelProgression.current_level.icon,
    levelProgression.current_level.name,
  );
  const recentBadges = badges
    .filter(badge => Boolean(badge.earned_at))
    .sort((first, second) => {
      const firstDate = first.earned_at ? new Date(first.earned_at).getTime() : 0;
      const secondDate = second.earned_at ? new Date(second.earned_at).getTime() : 0;
      return secondDate - firstDate;
    })
    .slice(0, 3);

  return (
    <article
      data-testid="level-card"
      className="h-full rounded-2xl border border-border bg-card p-6 shadow-sm"
    >
      <div className="flex flex-col items-center text-center">
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary text-white shadow-lg">
          <CurrentLevelIcon className="h-9 w-9" />
          <span className="absolute -bottom-2 right-0 rounded-full border border-primary bg-white px-2 py-0.5 text-xs font-bold text-primary">
            {levelProgression.current_level.min_points > 0
              ? Math.floor(levelProgression.current_level.min_points / 1000) + 1
              : 1}
          </span>
        </div>

        <p data-testid="level-current-name" className="mt-3 text-3xl font-bold text-fg">
          {levelProgression.current_level.name}
        </p>
      </div>

      <div className="mt-7">
        <div className="flex items-center justify-between text-sm">
          <span data-testid="level-progress-label" className="text-muted-fg">
            {levelProgression.is_max_level
              ? 'Nivel máximo alcanzado'
              : `Progreso al ${levelProgression.next_level?.name || 'siguiente nivel'}`}
          </span>
          <span className="font-semibold text-fg">
            {currentPoints} / {nextLevelTarget} pts
          </span>
        </div>

        <div className="mt-2 h-3 overflow-hidden rounded-full bg-primary/10">
          <div
            data-testid="level-progress-bar"
            data-progress={normalizedProgress}
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${normalizedProgress}%` }}
          />
        </div>

        {!levelProgression.is_max_level && (
          <p className="mt-2 text-center text-xs text-muted-fg">
            Te faltan{' '}
            <span data-testid="level-points-to-next" className="font-semibold text-primary">
              {levelProgression.points_to_next_level}
            </span>{' '}
            puntos para subir de nivel
          </p>
        )}
      </div>

      <div className="mt-6">
        <p className="text-sm font-medium text-fg">Ultimas medallas</p>

        <div className="mt-3 flex items-center gap-3">
          {badgesLoading && recentBadges.length === 0 && (
            <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
          )}

          {!badgesLoading && recentBadges.length === 0 && (
            <span className="text-xs text-muted-fg">Todavia no tienes medallas desbloqueadas.</span>
          )}

          {recentBadges.map((badge, index) => (
            <div
              key={badge.id}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary"
              title={badge.name}
            >
              {getBadgeIcon(badge.name, index)}
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
