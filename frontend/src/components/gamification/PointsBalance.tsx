'use client';

import { AlertTriangle, Sparkles } from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { useLevelProgression } from '@/hooks/useLevelProgression';
import { cn } from '@/lib/utils';

interface PointsBalanceProps {
  refreshTrigger?: number;
}

export default function PointsBalance({ refreshTrigger = 0 }: PointsBalanceProps) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { levelProgression, isLoading, error, refetch } = useLevelProgression(
    isAuthenticated,
    refreshTrigger,
  );

  const isInitialLoading = authLoading || (isLoading && !levelProgression && !error);

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
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
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
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm font-medium text-red-700">{error}</p>
        <button
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

  if (!levelProgression) {
    return null;
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
          <p className="mt-2 text-4xl font-extrabold leading-none text-primary">
            {levelProgression.points || 0}
          </p>
          <p className="mt-2 text-sm text-fg/80">Nivel de impacto en ReUse</p>
        </div>

        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white/70 ring-8 ring-primary/15">
          <Sparkles className="h-7 w-7 text-primary" />
        </div>
      </div>

      <p className="relative mt-4 text-xs text-muted-fg">
        Gana puntos publicando, completando transacciones e interactuando con la comunidad.
      </p>
    </article>
  );
}
