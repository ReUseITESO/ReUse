'use client';

import { useLevelProgression } from '@/hooks/useLevelProgression';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export default function PointsBalance() {
  const { isAuthenticated } = useAuth();
  const { levelProgression, isLoading, error, refetch } = useLevelProgression();

  if (isLoading) {
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
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="text-sm font-medium text-yellow-900">Sin sesion iniciada</p>
            <p className="mt-1 text-xs text-yellow-700">
              Inicia sesion para ver tus puntos, nivel y progreso.
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

  if (!levelProgression) {
    return null;
  }

  return (
    <article className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-medium text-blue-900 uppercase tracking-wide">
            Puntos Acumulados
          </h3>
          <div className="flex items-center gap-3">
            <p className="text-4xl font-bold text-blue-600">{levelProgression.points}</p>
            <span className="rounded-full bg-blue-200 px-3 py-1 text-xs font-semibold text-blue-900">
              {levelProgression.current_level.name}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-500 bg-opacity-10">
          <span className="text-2xl">⭐</span>
        </div>
      </div>

      <div className="mt-4">
        <div className="mb-1 flex items-center justify-between text-xs text-blue-800">
          <span>Progreso al siguiente nivel</span>
          <span>{levelProgression.progress_percent}%</span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-blue-200">
          <div
            className="h-2.5 rounded-full bg-blue-600 transition-all"
            style={{ width: `${levelProgression.progress_percent}%` }}
          />
        </div>
      </div>

      {levelProgression.is_max_level ? (
        <p className="mt-3 text-xs font-medium text-blue-800">Nivel maximo alcanzado.</p>
      ) : (
        <p className="mt-3 text-xs text-blue-700">
          Te faltan <strong>{levelProgression.points_to_next_level}</strong> puntos para llegar a{' '}
          <strong>{levelProgression.next_level?.name}</strong>.
        </p>
      )}

      <p className="mt-3 text-xs text-blue-700">
        Gana puntos publicando, completando transacciones e interactuando con la comunidad.
      </p>
    </article>
  );
}
