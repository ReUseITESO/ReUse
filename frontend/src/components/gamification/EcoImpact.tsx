'use client';

import { Leaf, Recycle, Users, Wind } from 'lucide-react';

import { useUserImpact } from '@/hooks/useUserImpact';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export default function EcoImpactCard() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data, isLoading, error, refetch } = useUserImpact(isAuthenticated);

  const isInitialLoading = authLoading || (isLoading && data === null && !error);

  // Loading (igual estilo que PointsBalance)
  if (isInitialLoading) {
    return (
      <div className="h-32 w-full rounded-lg bg-gradient-to-r from-muted to-muted/50 animate-pulse">
        <div className="flex items-center justify-center h-full">
          <div className="text-sm text-muted-fg">Cargando impacto ecológico...</div>
        </div>
      </div>
    );
  }

  // No autenticado
  if (!isAuthenticated) {
    return (
      <div
        data-testid="eco-impact-unauth"
        className="rounded-lg bg-warning/5 border border-warning/20 p-4"
      >
        <div className="flex items-start gap-3">
          <div>
            <p className="text-sm text-fg font-medium">Usuario no autenticado</p>
            <p className="mt-1 text-xs text-warning">Inicia sesión para ver tu impacto ecológico</p>
          </div>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div
        data-testid="eco-impact-error"
        className="rounded-lg bg-error/5 border border-error/20 p-4"
      >
        <p className="text-sm text-error font-medium">{error}</p>
        <button
          data-testid="eco-impact-retry"
          onClick={refetch}
          className={cn(
            'mt-3 px-4 py-2 text-sm font-medium',
            'rounded-md bg-error/10 text-error',
            'hover:bg-error/20 transition-colors',
          )}
        >
          Reintentar
        </button>
      </div>
    );
  }

  // Seguridad extra
  if (!data) return null;

  const reusedLabel = data.items_reused === 1 ? 'item reutilizado' : 'items reutilizados';

  return (
    <article
      data-testid="eco-impact-card"
      className="flex h-full flex-col rounded-3xl border border-border bg-card p-6 shadow-sm"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700">
          <Leaf className="h-4 w-4" />
        </div>
        <h3 className="text-base font-semibold text-fg">Impacto Ecologico</h3>
      </div>

      <div className="mt-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 p-4 text-white shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
            <Recycle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-white/90">Total contribuido</p>
            <p
              data-testid="eco-impact-hero-label"
              className="text-4xl font-extrabold leading-none"
            >
              {data.items_reused} {reusedLabel}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex-1 space-y-2.5">
        <div className="flex items-center justify-between rounded-2xl bg-muted/60 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-background text-muted-fg">
              <Recycle className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold text-fg">Items reutilizados</span>
          </div>
          <span data-testid="eco-impact-items" className="text-xl font-semibold text-fg">
            {data.items_reused}
          </span>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-muted/60 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-background text-muted-fg">
              <Wind className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold text-fg">CO2 evitado</span>
          </div>
          <span data-testid="eco-impact-co2" className="text-xl font-semibold text-fg">
            {data.co2_avoided} kg
          </span>
        </div>

        <div className="flex items-center justify-between rounded-2xl bg-muted/60 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-background text-muted-fg">
              <Users className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold text-fg">Promedio comunidad</span>
          </div>
          <span data-testid="eco-impact-community-avg" className="text-xl font-semibold text-fg">
            {data.community_average_items}
          </span>
        </div>
      </div>
    </article>
  );
}
