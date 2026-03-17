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
      <div className="h-24 w-full rounded-lg bg-gradient-to-r from-muted to-muted/50 animate-pulse">
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
    <article className="rounded-lg bg-gradient-to-br from-primary/5 to-primary/15 border border-primary/20 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-fg uppercase tracking-wide">Puntos Acumulados</h3>
          <p className="mt-1 text-4xl font-bold text-primary">{points || 0}</p>
        </div>
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
          <span className="text-2xl">⭐</span>
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-fg">
        Gana puntos publicando, completando transacciones e interactuando con la comunidad.
      </p>
    </article>
  );
}
