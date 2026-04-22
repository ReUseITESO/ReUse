'use client';

import Link from 'next/link';
import {
  AlertTriangle,
  Gift,
  HandHeart,
  ReceiptText,
  Sparkles,
  Tag,
  TrendingUp,
} from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { usePointsHistory } from '@/hooks/usePointsHistory';
import { useUserPoints } from '@/hooks/useUserPoints';
import { cn } from '@/lib/utils';
import type { PointHistoryEntry } from '@/types/gamification';

interface PointsBalanceProps {
  refreshTrigger?: number;
}

export default function PointsBalance({ refreshTrigger = 0 }: PointsBalanceProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { points, isLoading, error, refetch } = useUserPoints(isAuthenticated, refreshTrigger);
  const { entries, isLoading: historyLoading } = usePointsHistory(isAuthenticated);

  const isInitialLoading = authLoading || (isLoading && points === null && !error);

  if (isInitialLoading) {
    return (
      <div className="h-24 w-full animate-pulse rounded-lg bg-gradient-to-r from-slate-100 to-slate-50">
        <div className="flex h-full items-center justify-center">
          <div className="text-sm text-slate-500">Cargando puntos...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div
        data-testid="points-balance-unauth"
        className="rounded-lg border border-yellow-200 bg-yellow-50 p-4"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 text-yellow-700" />
          <div>
            <p className="text-sm font-medium text-yellow-900">Usuario no autenticado</p>
            <p className="mt-1 text-xs text-yellow-700">
              Inicia sesion para ver tus puntos acumulados
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        data-testid="points-balance-error"
        className="rounded-lg border border-red-200 bg-red-50 p-4"
      >
        <p className="text-sm font-medium text-red-700">{error}</p>
        <button
          data-testid="points-balance-retry"
          onClick={refetch}
          className={cn(
            'mt-3 rounded-md px-4 py-2 text-sm font-medium',
            'bg-red-100 text-red-700',
            'transition-colors hover:bg-red-200',
            'focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
          )}
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (points === null) {
    return null;
  }

  const recentEntries = entries.slice(0, 3);

  function formatRelativeDay(value: string) {
    const entryDate = new Date(value);
    const now = new Date();
    const currentDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const targetDay = new Date(
      entryDate.getFullYear(),
      entryDate.getMonth(),
      entryDate.getDate(),
    ).getTime();
    const dayDiff = Math.floor((currentDay - targetDay) / (1000 * 60 * 60 * 24));

    if (dayDiff <= 0) return 'Hoy';
    if (dayDiff === 1) return 'Ayer';
    return `Hace ${dayDiff} dias`;
  }

  function normalizeActionLabel(entry: PointHistoryEntry) {
    if (entry.action_display) {
      return entry.action_display;
    }

    if (entry.action === 'publish_item') return 'Articulo publicado';
    if (entry.action === 'complete_donation') return 'Articulo donado';
    if (entry.action === 'complete_sale') return 'Venta completada';
    if (entry.action === 'complete_exchange') return 'Intercambio completado';
    if (entry.action === 'receive_positive_review') return 'Resena positiva';
    if (entry.action === 'challenge_completion') return 'Reto completado';
    return 'Actividad';
  }

  function getEntryIcon(entry: PointHistoryEntry) {
    if (entry.action === 'complete_donation') return HandHeart;
    if (entry.action === 'complete_sale' || entry.action === 'complete_exchange')
      return ReceiptText;
    if (entry.action === 'challenge_completion') return Gift;
    if (entry.action === 'publish_item') return Tag;
    return TrendingUp;
  }

  function pointsLabel(points: number) {
    return points >= 0 ? `+${points}` : `${points}`;
  }

  return (
    <article
      data-testid="points-balance-card"
      className="h-full rounded-3xl border border-border bg-card p-6 shadow-sm"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Sparkles className="h-4 w-4" />
        </div>
        <h3 className="text-base font-semibold text-fg">Puntos Acumulados</h3>
      </div>

      <div className="mt-5 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 p-4 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-white/90">Total de puntos</p>
            <p data-testid="points-balance-total" className="text-5xl font-extrabold leading-none">
              {(points ?? 0).toLocaleString('es-MX')}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-fg">
          Actividad reciente
        </p>

        <div className="mt-3 space-y-2.5">
          {historyLoading && recentEntries.length === 0 ? (
            <div className="h-14 animate-pulse rounded-2xl bg-muted" />
          ) : null}

          {!historyLoading && recentEntries.length === 0 ? (
            <div className="rounded-2xl bg-muted/60 px-4 py-3 text-sm text-muted-fg">
              Aun no tienes movimientos recientes.
            </div>
          ) : null}

          {recentEntries.map(entry => {
            const EntryIcon = getEntryIcon(entry);
            return (
              <div
                key={entry.id}
                className="flex items-center justify-between rounded-2xl bg-muted/60 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-background text-muted-fg">
                    <EntryIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold leading-tight text-fg">
                      {normalizeActionLabel(entry)}
                    </p>
                    <p className="text-xs text-muted-fg">{formatRelativeDay(entry.created_at)}</p>
                  </div>
                </div>
                <p className="text-xl font-semibold text-primary">{pointsLabel(entry.points)}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-5 text-center">
        <Link
          href="/profile/points-history"
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition-colors hover:text-primary-hover"
        >
          Ver todo el historial
          <span aria-hidden="true">›</span>
        </Link>
      </div>
    </article>
  );
}
