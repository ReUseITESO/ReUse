import TransactionHistoryCard from '@/components/transactions/TransactionHistoryCard';
import type { Transaction } from '@/types/transaction';

interface TransactionListProps {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  onRetry: () => void;
  onPageChange: (page: number) => void;
}

function SkeletonCard() {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-border bg-card p-4">
      <div className="h-16 w-16 shrink-0 animate-pulse rounded-xl bg-muted" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
        <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

export default function TransactionList({
  transactions,
  isLoading,
  error,
  totalCount,
  currentPage,
  hasNextPage,
  hasPrevPage,
  onRetry,
  onPageChange,
}: TransactionListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-muted/50 p-8 text-center">
        <p className="text-sm text-destructive">{error}</p>
        <button
          onClick={onRetry}
          className="rounded-xl bg-btn-primary px-4 py-2 text-sm font-medium text-btn-primary-fg transition-colors hover:bg-primary-hover"
        >
          Intentar de nuevo
        </button>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-muted/50 p-8 text-center">
        <p className="text-sm font-medium text-fg">Sin transacciones</p>
        <p className="text-xs text-muted-fg">No se encontraron transacciones con los filtros seleccionados.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-fg">{totalCount} transacciones encontradas</p>

      <div className="space-y-3">
        {transactions.map((tx) => (
          <TransactionHistoryCard key={tx.id} transaction={tx} />
        ))}
      </div>

      {(hasPrevPage || hasNextPage) && (
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!hasPrevPage}
            className="rounded-xl border border-border px-4 py-1.5 text-sm font-medium text-fg transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            Anterior
          </button>
          <span className="text-sm text-muted-fg">Pagina {currentPage}</span>
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!hasNextPage}
            className="rounded-xl border border-border px-4 py-1.5 text-sm font-medium text-fg transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
