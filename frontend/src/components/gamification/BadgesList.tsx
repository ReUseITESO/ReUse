'use client';

import { useEffect, useState } from 'react';
import { BadgeWithStatus } from '@/types/gamification';

import Spinner from '@/components/ui/Spinner';
import ErrorMessage from '@/components/ui/ErrorMessage';
import { apiClient } from '@/lib/api';
import { cn } from '@/lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  Trophy,
  Star,
  Sprout,
  Handshake,
  ShieldCheck,
  HeartPulse,
  BookOpen,
  Crown,
  Gem,
  Rocket,
  Medal,
} from 'lucide-react';

export default function BadgesList() {
  const ITEMS_PER_PAGE = 4;
  const [badges, setBadges] = useState<BadgeWithStatus[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [unlockedPage, setUnlockedPage] = useState(1);
  const [lockedPage, setLockedPage] = useState(1);
  const [unlockedDirection, setUnlockedDirection] = useState<'left' | 'right'>('right');
  const [lockedDirection, setLockedDirection] = useState<'left' | 'right'>('right');

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const data = await apiClient<BadgeWithStatus[]>('/gamification/badges/status/');
        setBadges(data);
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : 'Fallo al obtener los logros. Vuelve a intentarlo mas tarde.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchBadges();
  }, []);

  const getIconForBadge = (badgeName: string) => {
    const name = badgeName.toLowerCase();
    if (name.includes('venta') || name.includes('comercio'))
      return <Rocket className="w-8 h-8 text-white relative z-10" />;
    if (name.includes('comprador') || name.includes('estrella'))
      return <Star className="w-8 h-8 text-white relative z-10" />;
    if (name.includes('eco') || name.includes('ambiente'))
      return <Sprout className="w-8 h-8 text-white relative z-10" />;
    if (name.includes('trueque') || name.includes('intercambio'))
      return <Handshake className="w-8 h-8 text-white relative z-10" />;
    if (name.includes('bienvenido') || name.includes('inicial'))
      return <ShieldCheck className="w-8 h-8 text-white relative z-10" />;
    if (name.includes('top') || name.includes('rey'))
      return <Crown className="w-8 h-8 text-white relative z-10" />;
    if (name.includes('libro')) return <BookOpen className="w-8 h-8 text-white relative z-10" />;
    if (name.includes('perfil')) return <Gem className="w-8 h-8 text-white relative z-10" />;
    if (name.includes('novato')) return <HeartPulse className="w-8 h-8 text-white relative z-10" />;
    return <Trophy className="w-8 h-8 text-white relative z-10" />;
  };

  const getGradientForBadge = (badgeName: string) => {
    const name = badgeName.toLowerCase();
    if (name.includes('eco')) return 'from-emerald-400 to-green-600';
    if (name.includes('top')) return 'from-amber-400 to-orange-500';
    if (name.includes('trueque')) return 'from-violet-400 to-fuchsia-600';
    if (name.includes('bienvenido')) return 'from-blue-400 to-cyan-500';
    if (name.includes('libro')) return 'from-rose-400 to-pink-600';
    if (name.includes('estrella')) return 'from-yellow-300 to-amber-500';
    if (name.includes('venta')) return 'from-red-400 to-rose-600';
    if (name.includes('perfil')) return 'from-sky-400 to-indigo-500';
    if (name.includes('novato')) return 'from-lime-400 to-green-500';
    return 'from-blue-500 to-indigo-600';
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} />;

  const unlockedBadges = badges
    .filter(badge => Boolean(badge.earned_at))
    .sort((first, second) => {
      const firstDate = first.earned_at ? new Date(first.earned_at).getTime() : 0;
      const secondDate = second.earned_at ? new Date(second.earned_at).getTime() : 0;
      return secondDate - firstDate;
    });
  const lockedBadges = badges.filter(badge => !badge.earned_at);

  const unlockedTotalPages = Math.max(1, Math.ceil(unlockedBadges.length / ITEMS_PER_PAGE));
  const lockedTotalPages = Math.max(1, Math.ceil(lockedBadges.length / ITEMS_PER_PAGE));

  const currentUnlockedPage = Math.min(unlockedPage, unlockedTotalPages);
  const currentLockedPage = Math.min(lockedPage, lockedTotalPages);

  const unlockedStart = (currentUnlockedPage - 1) * ITEMS_PER_PAGE;
  const lockedStart = (currentLockedPage - 1) * ITEMS_PER_PAGE;

  const visibleUnlocked = unlockedBadges.slice(unlockedStart, unlockedStart + ITEMS_PER_PAGE);
  const visibleLocked = lockedBadges.slice(lockedStart, lockedStart + ITEMS_PER_PAGE);

  function renderBadgeCard(badge: BadgeWithStatus, isLocked: boolean) {
    const gradient = getGradientForBadge(badge.name);

    return (
      <div
        key={badge.id}
        className={cn(
          'relative group flex h-full flex-col items-center rounded-2xl border p-5 text-center transition-all duration-500 ease-out',
          isLocked
            ? 'border-border/60 bg-muted/20 opacity-80 grayscale'
            : 'border-primary/20 bg-card hover:border-primary/50 hover:shadow-xl hover:-translate-y-1',
        )}
      >
        {!isLocked && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
            <div className="pointer-events-none absolute -inset-1 z-0 rounded-full bg-gradient-to-tr from-primary to-accent opacity-0 blur-2xl transition-opacity duration-700 group-hover:opacity-20" />
          </div>
        )}

        <div
          className={cn(
            'relative mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br shadow-lg transition-transform duration-500 group-hover:scale-105',
            isLocked ? 'from-slate-300 to-slate-400' : gradient,
          )}
        >
          <div className="absolute inset-0 z-0 rounded-3xl bg-white/20 backdrop-blur-sm" />
          {getIconForBadge(badge.name)}

          {isLocked && (
            <div className="absolute inset-0 z-20 flex items-center justify-center rounded-3xl bg-background/50 backdrop-blur-[1px]">
              <Medal className="h-8 w-8 text-muted-fg/80" />
            </div>
          )}
        </div>

        <div className="relative z-10 mt-2 flex w-full flex-1 flex-col">
          <h3
            className={cn(
              'mb-2 text-[15px] font-bold leading-tight',
              !isLocked ? `bg-gradient-to-r bg-clip-text text-transparent ${gradient}` : 'text-muted-fg',
            )}
          >
            {badge.name}
          </h3>
          <p className="mb-4 line-clamp-3 flex-1 text-[13px] leading-relaxed text-muted-fg">
            {badge.description}
          </p>

          <div className="mt-auto w-full border-t border-border/50 pt-3">
            {!isLocked ? (
              <div className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-success/10 px-2 py-1.5">
                <span className="h-2 w-2 animate-pulse rounded-full bg-success" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-success/90">
                  {new Date(badge.earned_at as string).toLocaleDateString('es-MX', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>
            ) : (
              <div className="inline-flex w-full items-center justify-center rounded-lg bg-muted/50 py-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-fg">
                  Bloqueado
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  function renderCarouselSection(
    title: string,
    sectionBadges: BadgeWithStatus[],
    page: number,
    totalPages: number,
    direction: 'left' | 'right',
    onPrev: () => void,
    onNext: () => void,
    isLocked: boolean,
  ) {
    return (
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-fg">{title}</h3>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onPrev}
              disabled={page <= 1}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-fg transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
              aria-label={`Pagina anterior de ${title.toLowerCase()}`}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-14 text-center text-xs text-muted-fg">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              onClick={onNext}
              disabled={page >= totalPages}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-fg transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
              aria-label={`Pagina siguiente de ${title.toLowerCase()}`}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {sectionBadges.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4 text-sm text-muted-fg">
            {isLocked
              ? 'No hay medallas bloqueadas pendientes.'
              : 'Todavia no tienes medallas desbloqueadas.'}
          </div>
        ) : (
          <div
            key={`${title}-${page}-${direction}`}
            className={cn(
              'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4',
              'animate-in fade-in-0 duration-500',
              direction === 'right' ? 'slide-in-from-right-10' : 'slide-in-from-left-10',
            )}
          >
            {sectionBadges.map(badge => renderBadgeCard(badge, isLocked))}
          </div>
        )}
      </section>
    );
  }

  function changeUnlockedPage(delta: -1 | 1) {
    const next = Math.min(unlockedTotalPages, Math.max(1, currentUnlockedPage + delta));
    if (next === currentUnlockedPage) {
      return;
    }

    setUnlockedDirection(delta > 0 ? 'right' : 'left');
    setUnlockedPage(next);
  }

  function changeLockedPage(delta: -1 | 1) {
    const next = Math.min(lockedTotalPages, Math.max(1, currentLockedPage + delta));
    if (next === currentLockedPage) {
      return;
    }

    setLockedDirection(delta > 0 ? 'right' : 'left');
    setLockedPage(next);
  }

  return (
    <div className="space-y-8">
      {renderCarouselSection(
        'Desbloqueados',
        visibleUnlocked,
        currentUnlockedPage,
        unlockedTotalPages,
        unlockedDirection,
        () => changeUnlockedPage(-1),
        () => changeUnlockedPage(1),
        false,
      )}

      {renderCarouselSection(
        'Bloqueados',
        visibleLocked,
        currentLockedPage,
        lockedTotalPages,
        lockedDirection,
        () => changeLockedPage(-1),
        () => changeLockedPage(1),
        true,
      )}
    </div>
  );
}
