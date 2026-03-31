'use client';

import { ArrowUpDown, Layers3, ListFilter, PackageSearch, RefreshCcw } from 'lucide-react';
import AppSelect from '@/components/ui/AppSelect';
import Button from '@/components/ui/Button';
import { useCategories } from '@/hooks/useCategories';
import type { ProductFilters } from '@/hooks/useProducts';

type FilterBarFilters = Omit<ProductFilters, 'search'>;

interface FilterBarProps {
  filters: FilterBarFilters;
  onChange: (filters: FilterBarFilters) => void;
  showContainer?: boolean;
}

const CONDITIONS = [
  { value: '', label: 'Cualquier condición' },
  { value: 'nuevo', label: 'Nuevo' },
  { value: 'como_nuevo', label: 'Como nuevo' },
  { value: 'buen_estado', label: 'Buen estado' },
  { value: 'usado', label: 'Usado' },
] as const;

const TRANSACTION_TYPES = [
  { value: '', label: 'Cualquier tipo' },
  { value: 'sale', label: 'Venta' },
  { value: 'donation', label: 'Donación' },
  { value: 'swap', label: 'Intercambio' },
] as const;

const ORDERING_OPTIONS = [
  { value: '', label: 'Más recientes primero' },
  { value: 'created_at', label: 'Más antiguos primero' },
  { value: 'price', label: 'Precio: menor a mayor' },
  { value: '-price', label: 'Precio: mayor a menor' },
  { value: 'title', label: 'Nombre: A → Z' },
  { value: '-title', label: 'Nombre: Z → A' },
] as const;

export default function FilterBar({ filters, onChange, showContainer = true }: FilterBarProps) {
  const { categories, isLoading: loadingCats } = useCategories();
  const hasActiveFilters = Boolean(
    filters.category || filters.condition || filters.transaction_type || filters.ordering,
  );

  function handleFilter(field: keyof FilterBarFilters, value: string) {
    onChange({ ...filters, [field]: value || undefined });
  }

  function handleClear() {
    onChange({
      category: undefined,
      condition: undefined,
      transaction_type: undefined,
      ordering: undefined,
    });
  }

  const header = (
    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
      <span className="inline-flex items-center gap-2 text-sm text-fg">
        <ListFilter className="h-4 w-4 text-info" />
        Filtros del marketplace
      </span>

      {hasActiveFilters && (
        <Button
          type="button"
          variant="template"
          onClick={handleClear}
          className="inline-flex items-center gap-2"
        >
          <RefreshCcw className="h-4 w-4" />
          Limpiar filtros
        </Button>
      )}
    </div>
  );

  const conditionOptions = CONDITIONS.filter(item => item.value).map(item => ({
    value: item.value,
    label: item.label,
  }));
  const transactionOptions = TRANSACTION_TYPES.filter(item => item.value).map(item => ({
    value: item.value,
    label: item.label,
  }));
  const orderingOptions = ORDERING_OPTIONS.filter(item => item.value).map(item => ({
    value: item.value,
    label: item.label,
  }));

  const filtersGrid = (
    <div className="mt-4 grid gap-3 border-t border-border/70 pt-4 sm:grid-cols-2 xl:grid-cols-4">
      <div className="space-y-1">
        <p className="inline-flex items-center gap-1 text-xs text-muted-fg">
          <Layers3 className="h-3.5 w-3.5" />
          Categoría
        </p>
        <AppSelect
          value={filters.category ?? ''}
          onValueChange={value => handleFilter('category', value)}
          placeholder="Todas las categorías"
          options={categories.map(cat => ({ value: String(cat.id), label: cat.name }))}
          disabled={loadingCats}
          emptyOptionLabel="Todas las categorías"
        />
      </div>

      <div className="space-y-1">
        <p className="inline-flex items-center gap-1 text-xs text-muted-fg">
          <PackageSearch className="h-3.5 w-3.5" />
          Condición
        </p>
        <AppSelect
          value={filters.condition ?? ''}
          onValueChange={value => handleFilter('condition', value)}
          placeholder="Cualquier condición"
          options={conditionOptions}
          emptyOptionLabel="Cualquier condición"
        />
      </div>

      <div className="space-y-1">
        <p className="inline-flex items-center gap-1 text-xs text-muted-fg">
          <RefreshCcw className="h-3.5 w-3.5" />
          Tipo de transacción
        </p>
        <AppSelect
          value={filters.transaction_type ?? ''}
          onValueChange={value => handleFilter('transaction_type', value)}
          placeholder="Cualquier tipo"
          options={transactionOptions}
          emptyOptionLabel="Cualquier tipo"
        />
      </div>

      <div className="space-y-1">
        <p className="inline-flex items-center gap-1 text-xs text-muted-fg">
          <ArrowUpDown className="h-3.5 w-3.5" />
          Orden
        </p>
        <AppSelect
          value={filters.ordering ?? ''}
          onValueChange={value => handleFilter('ordering', value)}
          placeholder="Más recientes primero"
          options={orderingOptions}
          emptyOptionLabel="Más recientes primero"
        />
      </div>
    </div>
  );

  if (!showContainer) {
    return filtersGrid;
  }

  return (
    <div className="rounded-xl border border-border bg-card p-3 sm:p-4">
      {header}
      {filtersGrid}
    </div>
  );
}
