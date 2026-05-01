'use client';

import { useMemo, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { usePointsHistory } from '@/hooks/usePointsHistory';
import type { PointsHistoryFilters } from '@/types/gamification';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import ErrorMessage from '@/components/ui/ErrorMessage';
import Spinner from '@/components/ui/Spinner';

const ACTION_OPTIONS = [
  { value: '', label: 'Todas las acciones' },
  { value: 'publish_item', label: 'Publicar articulo' },
  { value: 'complete_donation', label: 'Donacion completada' },
  { value: 'complete_sale', label: 'Venta completada' },
  { value: 'complete_exchange', label: 'Intercambio completado' },
  { value: 'receive_positive_review', label: 'Resena positiva' },
  { value: 'points_deduction', label: 'Deduccion de puntos' },
];

const ORDER_OPTIONS = [
  { value: '-created_at', label: 'Fecha: mas reciente' },
  { value: 'created_at', label: 'Fecha: mas antigua' },
  { value: '-points', label: 'Puntos: mayor a menor' },
  { value: 'points', label: 'Puntos: menor a mayor' },
];

const ACTION_LABELS: Record<string, string> = {
  publish_item: 'Publicacion de articulo',
  complete_donation: 'Donacion completada',
  complete_sale: 'Venta completada',
  complete_exchange: 'Intercambio completado',
  receive_positive_review: 'Resena positiva recibida',
  points_deduction: 'Deduccion de puntos',
};

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function buildLastDaysRange(days: number) {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - (days - 1));
  return {
    start_date: toIsoDate(start),
    end_date: toIsoDate(end),
  };
}

function formatDateTime(value: string) {
  const date = new Date(value);
  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function pointsClass(points: number) {
  return points >= 0 ? 'text-emerald-700' : 'text-red-700';
}

function pointsLabel(points: number) {
  return points >= 0 ? `+${points}` : `${points}`;
}

function normalizeActionLabel(action: string, actionDisplay: string) {
  return ACTION_LABELS[action] ?? actionDisplay ?? action;
}

function formatAssociatedLabel(referenceLabel: string | null, referenceId: number | null) {
  if (referenceLabel) {
    return referenceLabel;
  }
  if (referenceId) {
    return `ID #${referenceId}`;
  }
  return 'Sin referencia';
}

function formatReferenceType(referenceType: 'product' | 'transaction' | null) {
  if (referenceType === 'product') {
    return 'Producto';
  }
  if (referenceType === 'transaction') {
    return 'Transaccion';
  }
  return null;
}

export default function PointsHistoryCard() {
  const { isAuthenticated } = useAuth();
  const {
    entries,
    count,
    page,
    hasNextPage,
    hasPrevPage,
    isLoading,
    error,
    filters,
    fetchHistory,
  } = usePointsHistory(isAuthenticated);

  const [draftFilters, setDraftFilters] = useState<PointsHistoryFilters>({
    ordering: '-created_at',
  });

  const rangeError = useMemo(() => {
    if (
      draftFilters.start_date &&
      draftFilters.end_date &&
      draftFilters.start_date > draftFilters.end_date
    ) {
      return 'La fecha inicial no puede ser mayor que la fecha final.';
    }
    return null;
  }, [draftFilters.end_date, draftFilters.start_date]);

  if (!isAuthenticated) {
    return (
      <Card>
        <p className="text-sm text-slate-600">Inicia sesion para ver el historial de puntos.</p>
      </Card>
    );
  }

  const handleDraftChange = (patch: Partial<PointsHistoryFilters>) => {
    setDraftFilters(current => ({ ...current, ...patch }));
  };

  const handleApplyFilters = () => {
    if (rangeError) {
      return;
    }
    fetchHistory(draftFilters, 1);
  };

  const handleClearFilters = () => {
    const cleared = { ordering: '-created_at' };
    setDraftFilters(cleared);
    fetchHistory(cleared, 1);
  };

  const applyQuickRange = (days: number) => {
    const range = buildLastDaysRange(days);
    const next = { ...draftFilters, ...range };
    setDraftFilters(next);
    fetchHistory(next, 1);
  };

  return (
    <Card className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">Historial de puntos</h3>
          <p className="mt-1 text-sm text-slate-500">
            Consulta como ganaste o perdiste puntos por accion, fecha y referencia.
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          <strong>{count}</strong> movimientos totales
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            Rangos rapidos
          </span>
          <button
            type="button"
            onClick={() => applyQuickRange(7)}
            className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
          >
            Ultimos 7 dias
          </button>
          <button
            type="button"
            onClick={() => applyQuickRange(30)}
            className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
          >
            Ultimos 30 dias
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-700">Desde</span>
            <input
              type="date"
              value={draftFilters.start_date ?? ''}
              onChange={e => handleDraftChange({ start_date: e.target.value || undefined })}
              className="rounded-md border border-slate-300 px-3 py-2"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-700">Hasta</span>
            <input
              type="date"
              value={draftFilters.end_date ?? ''}
              onChange={e => handleDraftChange({ end_date: e.target.value || undefined })}
              className="rounded-md border border-slate-300 px-3 py-2"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-700">Accion</span>
            <select
              value={draftFilters.action ?? ''}
              onChange={e => handleDraftChange({ action: e.target.value || undefined })}
              className="rounded-md border border-slate-300 px-3 py-2"
            >
              {ACTION_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-700">Orden</span>
            <select
              value={draftFilters.ordering ?? '-created_at'}
              onChange={e => handleDraftChange({ ordering: e.target.value })}
              className="rounded-md border border-slate-300 px-3 py-2"
            >
              {ORDER_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleApplyFilters}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Aplicar filtros
          </button>
          <button
            type="button"
            onClick={handleClearFilters}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Limpiar
          </button>
        </div>
      </div>

      {rangeError ? <ErrorMessage message={rangeError} /> : null}
      {error ? (
        <ErrorMessage message={`${error} Verifica tus filtros y vuelve a intentar.`} />
      ) : null}

      {isLoading ? (
        <div className="rounded-lg border border-slate-200 bg-white py-8">
          <Spinner />
          <p className="mt-2 text-center text-sm text-slate-500">
            Cargando movimientos de puntos...
          </p>
        </div>
      ) : entries.length === 0 ? (
        <EmptyState
          message="No hay movimientos para los filtros seleccionados."
          actionLabel="Quitar filtros"
          onAction={handleClearFilters}
        />
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-lg border border-slate-200 md:block">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Fecha y hora</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Acción</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Asociado</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-700">Puntos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {entries.map(entry => (
                  <tr key={entry.id} className="bg-white hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-700">{formatDateTime(entry.created_at)}</td>
                    <td className="px-4 py-3 text-slate-700">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                        {normalizeActionLabel(entry.action, entry.action_display)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <div className="space-y-0.5">
                        <p>{formatAssociatedLabel(entry.reference_label, entry.reference_id)}</p>
                        {formatReferenceType(entry.reference_type) ? (
                          <p className="text-xs text-slate-500">
                            {formatReferenceType(entry.reference_type)}
                          </p>
                        ) : null}
                      </div>
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-semibold ${pointsClass(entry.points)}`}
                    >
                      {pointsLabel(entry.points)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {entries.map(entry => (
              <div key={entry.id} className="rounded-lg border border-slate-200 bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-slate-500">{formatDateTime(entry.created_at)}</p>
                    <p className="mt-1 text-sm font-medium text-slate-800">
                      {normalizeActionLabel(entry.action, entry.action_display)}
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      {formatAssociatedLabel(entry.reference_label, entry.reference_id)}
                    </p>
                  </div>
                  <p className={`text-base font-semibold ${pointsClass(entry.points)}`}>
                    {pointsLabel(entry.points)}
                  </p>
                </div>
                <p className={`mt-2 text-sm font-semibold ${pointsClass(entry.points)}`}>
                  {pointsLabel(entry.points)} puntos
                </p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => fetchHistory(filters, page - 1)}
              disabled={!hasPrevPage}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="text-sm text-slate-600">Pagina {page}</span>
            <button
              type="button"
              onClick={() => fetchHistory(filters, page + 1)}
              disabled={!hasNextPage}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </>
      )}
    </Card>
  );
}
