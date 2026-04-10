'use client';

import { useUserImpact } from '@/hooks/useUserImpact';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export default function EcoImpactCard() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { data, isLoading, error, refetch } = useUserImpact(isAuthenticated);

  const isInitialLoading =
    authLoading || (isLoading && data === null && !error);

  // Loading (igual estilo que PointsBalance)
  if (isInitialLoading) {
    return (
      <div className="h-32 w-full rounded-lg bg-gradient-to-r from-muted to-muted/50 animate-pulse">
        <div className="flex items-center justify-center h-full">
          <div className="text-sm text-muted-fg">
            Cargando impacto ecológico...
          </div>
        </div>
      </div>
    );
  }

  // No autenticado
  if (!isAuthenticated) {
    return (
      <div className="rounded-lg bg-warning/5 border border-warning/20 p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="text-sm text-fg font-medium">
              Usuario no autenticado
            </p>
            <p className="mt-1 text-xs text-warning">
              Inicia sesión para ver tu impacto ecológico
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="rounded-lg bg-error/5 border border-error/20 p-4">
        <p className="text-sm text-error font-medium">{error}</p>
        <button
          onClick={refetch}
          className={cn(
            'mt-3 px-4 py-2 text-sm font-medium',
            'rounded-md bg-error/10 text-error',
            'hover:bg-error/20 transition-colors'
          )}
        >
          Reintentar
        </button>
      </div>
    );
  }

  // Seguridad extra
  if (!data) return null;

  const isAboveAverage =
    data.items_reused >= data.community_average_items;

  return (
    <article className="rounded-lg bg-gradient-to-br from-green-500/5 to-green-500/15 border border-green-500/20 p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-fg uppercase tracking-wide">
            Impacto Ecológico
          </h3>
          <p className="mt-1 text-2xl font-bold text-green-600">
            {data.items_reused} items reutilizados
          </p>
        </div>

        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10">
          <span className="text-2xl">🌱</span>
        </div>
      </div>

      {/* Métricas */}
      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        <Metric title="Reutilizados" value={data.items_reused} />
        <Metric title="Salvados" value={data.items_saved_from_waste} />
        <Metric title="CO₂ evitado" value={`${data.co2_avoided} kg`} />
        <Metric title="Promedio comunidad" value={data.community_average_items} />
      </div>

      {/* Comparativa */}
      <div className="mt-4 text-xs text-muted-fg">
        {isAboveAverage ? (
          <span className="text-green-600 font-medium">
            Estás por encima del promedio de la comunidad
          </span>
        ) : (
          <span>
            Sigue así, estás cerca del promedio de la comunidad
          </span>
        )}
      </div>
    </article>
  );
}

function Metric({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 p-3 text-center">
      <p className="text-xs text-muted-fg">{title}</p>
      <p className="mt-1 text-lg font-semibold text-fg">{value}</p>
    </div>
  );
}