import { CheckCircle2, Search, SearchX } from 'lucide-react';
import { SearchResultsBadgeProps } from '@/types/searchs';

export default function SearchResultsBadge({
  totalCount,
  isLoading,
  hasFilters,
}: SearchResultsBadgeProps) {
  const totalLabel = totalCount === 1 ? 'resultado disponible' : 'resultados disponibles';

  if (isLoading) {
    return (
      <div className="mt-3 flex justify-end">
        <p className="inline-flex items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-1.5 text-xs text-muted-fg">
          <Search className="h-3.5 w-3.5" />
          Buscando productos...
        </p>
      </div>
    );
  }

  if (!hasFilters) {
    return (
      <div className="mt-3 flex justify-end">
        <p className="inline-flex items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-1.5 text-xs text-muted-fg">
          <Search className="h-3.5 w-3.5" />
          {totalCount} {totalLabel}
        </p>
      </div>
    );
  }

  if (totalCount === 0) {
    return (
      <div className="mt-3 flex justify-end">
        <p className="inline-flex items-center gap-2 rounded-md border border-error/45 bg-error/10 px-3 py-1.5 text-xs text-error">
          <SearchX className="h-3.5 w-3.5" />
          Sin resultados para este filtro
        </p>
      </div>
    );
  }

  return (
    <div className="mt-3 flex justify-end">
      <p className="inline-flex items-center gap-2 rounded-md border border-success/45 bg-success/10 px-3 py-1.5 text-xs text-success">
        <CheckCircle2 className="h-3.5 w-3.5" />
        {totalCount} {totalLabel}
      </p>
    </div>
  );
}
