'use client';

import { useUserPoints } from '@/hooks/useUserPoints';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface PointsBalanceProps {
  refreshTrigger?: number;
}

export default function PointsBalance({ refreshTrigger = 0 }: PointsBalanceProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { points, isLoading, error, refetch } = useUserPoints(isAuthenticated, refreshTrigger);

  const isInitialLoading = authLoading || (isLoading && points === null && !error);

  if (isInitialLoading) {
    return (
      <div className="h-28 w-full animate-pulse rounded-2xl bg-gradient-to-r from-muted to-muted/50">
        <div className="flex items-center justify-center h-full">
          <div className="text-sm text-muted-fg">Cargando puntos...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="rounded-lg bg-warning/5 border border-warning/20 p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="text-sm text-fg font-medium">Usuario no autenticado</p>
            <p className="mt-1 text-xs text-warning">
              Inicia sesión para ver tus puntos acumulados
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-error/5 border border-error/20 p-4">
        <p className="text-sm text-error font-medium">{error}</p>
        <button
          onClick={refetch}
          className={cn(
            'mt-3 px-4 py-2 text-sm font-medium',
            'rounded-md bg-error/10 text-error',
            'hover:bg-error/20 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          )}
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <article className="relative overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 via-primary/5 to-emerald-400/10 p-6 shadow-sm">
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
      <div className="pointer-events-none absolute -left-8 -bottom-10 h-28 w-28 rounded-full bg-emerald-400/15 blur-2xl" />

      <div className="relative flex items-center justify-between">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-fg">
            Puntos Acumulados
          </h3>
          <p className="mt-2 text-4xl font-extrabold leading-none text-primary">{points || 0}</p>
          <p className="mt-2 text-sm text-fg/80">Nivel de impacto en ReUse</p>
        </div>

        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white/70 ring-8 ring-primary/15">
          <span className="text-2xl">⭐</span>
        </div>
      </div>

      <p className="relative mt-4 text-xs text-muted-fg">
        Gana puntos publicando, completando transacciones e interactuando con la comunidad.
      </p>
    </article>
  );
}
