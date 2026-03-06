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
      <div className="h-24 w-full rounded-lg bg-gradient-to-r from-slate-100 to-slate-50 animate-pulse">
        <div className="flex items-center justify-center h-full">
          <div className="text-sm text-slate-500">Cargando puntos...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="text-sm text-yellow-900 font-medium">Usuario no autenticado</p>
            <p className="mt-1 text-xs text-yellow-700">
              Inicia sesión para ver tus puntos acumulados
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-4">
        <p className="text-sm text-red-700 font-medium">{error}</p>
        <button
          onClick={refetch}
          className={cn(
            'mt-3 px-4 py-2 text-sm font-medium',
            'rounded-md bg-red-100 text-red-700',
            'hover:bg-red-200 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2',
          )}
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <article className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-blue-900 uppercase tracking-wide">
            Puntos Acumulados
          </h3>
          <p className="mt-1 text-4xl font-bold text-blue-600">{points || 0}</p>
        </div>
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-500 bg-opacity-10">
          <span className="text-2xl">⭐</span>
        </div>
      </div>
      <p className="mt-3 text-xs text-blue-700">
        Gana puntos publicando, completando transacciones e interactuando con la comunidad.
      </p>
    </article>
  );
}
