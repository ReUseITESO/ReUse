'use client';

import { useState } from 'react';
import type { TransactionFilters, TransactionType } from '@/types/transaction';

interface TransactionFiltersProps {
  filters: TransactionFilters;
  onApply: (filters: TransactionFilters) => void;
}

const TRANSACTION_TYPES: { value: TransactionType; label: string }[] = [
  { value: 'sale', label: 'Venta' },
  { value: 'donation', label: 'Donacion' },
  { value: 'swap', label: 'Intercambio' },
];

export default function TransactionFiltersPanel({ filters, onApply }: TransactionFiltersProps) {
  const [type, setType] = useState<TransactionType | ''>(filters.transaction_type ?? '');
  const [dateFrom, setDateFrom] = useState(filters.date_from ?? '');
  const [dateTo, setDateTo] = useState(filters.date_to ?? '');

  function handleApply() {
    onApply({
      ...(type && { transaction_type: type }),
      ...(dateFrom && { date_from: dateFrom }),
      ...(dateTo && { date_to: dateTo }),
    });
  }

  function handleClear() {
    setType('');
    setDateFrom('');
    setDateTo('');
    onApply({});
  }

  const hasActiveFilters = Boolean(
    filters.transaction_type || filters.date_from || filters.date_to,
  );

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="tx-type" className="text-xs font-medium text-muted-fg">
            Tipo
          </label>
          <select
            id="tx-type"
            value={type}
            onChange={e => setType(e.target.value as TransactionType | '')}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Todos</option>
            {TRANSACTION_TYPES.map(t => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="date-from" className="text-xs font-medium text-muted-fg">
            Desde
          </label>
          <input
            id="date-from"
            type="date"
            value={dateFrom}
            max={dateTo || undefined}
            onChange={e => setDateFrom(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="date-to" className="text-xs font-medium text-muted-fg">
            Hasta
          </label>
          <input
            id="date-to"
            type="date"
            value={dateTo}
            min={dateFrom || undefined}
            onChange={e => setDateTo(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div className="flex items-end gap-2">
          <button
            onClick={handleApply}
            className="rounded-xl bg-btn-primary px-4 py-1.5 text-sm font-medium text-btn-primary-fg transition-colors hover:bg-primary-hover"
          >
            Filtrar
          </button>
          {hasActiveFilters && (
            <button
              onClick={handleClear}
              className="rounded-xl border border-border px-4 py-1.5 text-sm font-medium text-muted-fg transition-colors hover:bg-muted"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
