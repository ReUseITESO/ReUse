'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { Award, Crown, Medal, Star, Trophy } from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { useUserPoints } from '@/hooks/useUserPoints';
import { apiClient } from '@/lib/api';
import type { CommunityMember, CommunityPost } from '@/types/community';
import type { BadgeWithStatus } from '@/types/gamification';

interface LeaderBoardProps {
  members: CommunityMember[];
  posts: CommunityPost[];
}

function countPostsByUser(posts: CommunityPost[]): Map<number, number> {
  const map = new Map<number, number>();
  for (const p of posts) {
    map.set(p.user, (map.get(p.user) ?? 0) + 1);
  }
  return map;
}

function rankLabel(index: number): { icon: ReactNode; className: string } {
  if (index === 0) {
    return {
      icon: <Trophy className="h-4 w-4 text-amber-500" />,
      className: 'bg-amber-500/10 border-amber-500/30',
    };
  }
  if (index === 1) {
    return {
      icon: <Medal className="h-4 w-4 text-slate-400" />,
      className: 'bg-slate-400/10 border-slate-400/25',
    };
  }
  if (index === 2) {
    return {
      icon: <Medal className="h-4 w-4 text-amber-700" />,
      className: 'bg-amber-800/10 border-amber-800/25',
    };
  }
  return {
    icon: (
      <span className="w-5 text-center text-xs font-semibold text-muted-foreground">
        {index + 1}
      </span>
    ),
    className: 'border-border',
  };
}

export default function LeaderBoard({ members, posts }: LeaderBoardProps) {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { points, isLoading: pointsLoading, error: pointsError } = useUserPoints(isAuthenticated);

  const [badges, setBadges] = useState<BadgeWithStatus[]>([]);
  const [badgesLoading, setBadgesLoading] = useState(true);
  const [badgesError, setBadgesError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setBadges([]);
      setBadgesLoading(false);
      setBadgesError(null);
      return;
    }

    let cancelled = false;
    setBadgesLoading(true);
    setBadgesError(null);

    apiClient<BadgeWithStatus[]>('/gamification/badges/status/')
      .then(data => {
        if (!cancelled) setBadges(data);
      })
      .catch(() => {
        if (!cancelled) setBadgesError('No se pudieron cargar las insignias');
      })
      .finally(() => {
        if (!cancelled) setBadgesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const postCounts = useMemo(() => countPostsByUser(posts), [posts]);

  const rankedMembers = useMemo(() => {
    return [...members].sort((a, b) => {
      const ca = postCounts.get(a.user.id) ?? 0;
      const cb = postCounts.get(b.user.id) ?? 0;
      if (cb !== ca) return cb - ca;
      return a.user.full_name.localeCompare(b.user.full_name, 'es');
    });
  }, [members, postCounts]);

  const earnedBadges = useMemo(() => badges.filter(b => b.earned_at), [badges]);

  if (authLoading) {
    return (
      <div className="space-y-3">
        <div className="h-7 w-40 animate-pulse rounded bg-muted" />
        <div className="h-28 animate-pulse rounded-lg bg-muted" />
        <div className="h-36 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="rounded-lg border border-warning/30 bg-warning/10 p-4 text-center">
        <p className="text-sm font-medium text-foreground">
          Inicia sesion para ver tu puntuacion e insignias
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Clasificacion</h2>

      {/* Tu resumen: puntos + insignias */}
      <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Tu resumen
        </p>

        {pointsError && <p className="mb-2 text-xs text-destructive">{pointsError}</p>}

        <div className="mb-4 flex items-center justify-between gap-2">
          <div>
            <p className="text-xs text-muted-foreground">Puntos globales</p>
            {pointsLoading ? (
              <div className="mt-1 h-8 w-16 animate-pulse rounded bg-muted" />
            ) : (
              <p className="text-2xl font-bold tabular-nums text-foreground">{points ?? 0}</p>
            )}
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10">
            <Star className="h-5 w-5 text-primary" />
          </div>
        </div>

        <div className="border-t border-border pt-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Insignias</span>
            <Link href="/dashboard" className="text-xs font-medium text-primary hover:underline">
              Ver dashboard
            </Link>
          </div>
          {badgesLoading ? (
            <div className="flex gap-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-9 w-9 animate-pulse rounded-full bg-muted" />
              ))}
            </div>
          ) : badgesError ? (
            <p className="text-xs text-muted-foreground">{badgesError}</p>
          ) : (
            <>
              <p className="mb-2 text-sm font-medium text-foreground">
                {earnedBadges.length} de {badges.length} desbloqueadas
              </p>
              {earnedBadges.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {earnedBadges.slice(0, 8).map(b => (
                    <span
                      key={b.id}
                      title={b.name}
                      className="inline-flex h-8 max-w-[140px] items-center gap-1 truncate rounded-full bg-primary/10 px-2 text-[10px] font-medium text-primary"
                    >
                      <Award className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{b.name}</span>
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Ranking por publicaciones en la comunidad */}
      <div>
        <p className="mb-2 text-xs text-muted-foreground">Por publicaciones en esta comunidad</p>
        {rankedMembers.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin miembros</p>
        ) : (
          <ul className="space-y-2">
            {rankedMembers.map((m, index) => {
              const n = postCounts.get(m.user.id) ?? 0;
              const isYou = m.user.id === user?.id;
              const { icon, className } = rankLabel(index);

              return (
                <li
                  key={m.id}
                  className={`flex items-center gap-2 rounded-lg border p-2.5 transition-colors ${className} ${
                    isYou ? 'ring-2 ring-primary/30' : ''
                  }`}
                >
                  <div className="flex w-7 shrink-0 items-center justify-center">{icon}</div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {m.user.full_name}
                      {m.role === 'admin' && (
                        <Crown className="ml-1 inline h-3.5 w-3.5 text-amber-500" />
                      )}
                      {isYou && <span className="ml-1 text-xs text-primary">(tu)</span>}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                    {n} pub.
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
