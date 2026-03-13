'use client';

import { useCategories } from '@/hooks/useCategories';
import type { ProductFilters } from '@/hooks/useProducts';
import type { ProductCondition, TransactionType } from '@/types/product';

type FilterBarFilters = Omit<ProductFilters, 'search'>;

interface FilterBarProps {
  filters: FilterBarFilters;
  onChange: (filters: FilterBarFilters) => void;
}

const CONDITIONS: { value: ProductCondition | ''; label: string }[] = [
  { value: '', label: 'Cualquier condición' },
  { value: 'nuevo', label: 'Nuevo' },
  { value: 'como_nuevo', label: 'Como nuevo' },
  { value: 'buen_estado', label: 'Buen estado' },
  { value: 'usado', label: 'Usado' },
];

const TRANSACTION_TYPES: { value: TransactionType | ''; label: string }[] = [
  { value: '', label: 'Cualquier tipo' },
  { value: 'sale', label: 'Venta' },
  { value: 'donation', label: 'Donación' },
  { value: 'swap', label: 'Intercambio' },
];

const ORDERING_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Más recientes primero' },
  { value: 'created_at', label: 'Más antiguos primero' },
  { value: 'price', label: 'Precio: menor a mayor' },
  { value: '-price', label: 'Precio: mayor a menor' },
  { value: 'title', label: 'Nombre: A → Z' },
  { value: '-title', label: 'Nombre: Z → A' },
];

const selectClass =
  'rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 ' +
  'focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 cursor-pointer';

export default function FilterBar({ filters, onChange }: FilterBarProps) {
  const { categories, isLoading: loadingCats } = useCategories();

  const hasActiveFilters = Boolean(
    filters.category || filters.condition || filters.transaction_type || filters.ordering,
  );

  function handleCategory(value: string) {
    onChange({ ...filters, category: value || undefined });
  }

  function handleCondition(value: string) {
    onChange({ ...filters, condition: value || undefined });
  }

  function handleTransactionType(value: string) {
    onChange({ ...filters, transaction_type: value || undefined });
  }

  function handleOrdering(value: string) {
    onChange({ ...filters, ordering: value || undefined });
  }

  function handleClear() {
    onChange({
      category: undefined,
      condition: undefined,
      transaction_type: undefined,
      ordering: undefined,
    });
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      {/* Category */}
      <select
        className={selectClass}
        value={filters.category ?? ''}
        onChange={e => handleCategory(e.target.value)}
        disabled={loadingCats}
        aria-label="Filtrar por categoría"
      >
        <option value="">Todas las categorías</option>
        {categories.map(cat => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>

      {/* Condition */}
      <select
        className={selectClass}
        value={filters.condition ?? ''}
        onChange={e => handleCondition(e.target.value)}
        aria-label="Filtrar por condición"
      >
        {CONDITIONS.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      {/* Transaction type */}
      <select
        className={selectClass}
        value={filters.transaction_type ?? ''}
        onChange={e => handleTransactionType(e.target.value)}
        aria-label="Filtrar por tipo de transacción"
      >
        {TRANSACTION_TYPES.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      {/* Ordering */}
      <select
        className={selectClass}
        value={filters.ordering ?? ''}
        onChange={e => handleOrdering(e.target.value)}
        aria-label="Ordenar resultados"
      >
        {ORDERING_OPTIONS.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      {/* Clear button – only when a filter is active */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={handleClear}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 transition-colors"
          aria-label="Limpiar filtros"
        >
          ✕ Limpiar filtros
        </button>
      )}
    </div>
  );
}
