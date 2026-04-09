'use client';

import { History } from 'lucide-react';

import TransactionFiltersPanel from '@/components/transactions/TransactionFiltersPanel';
import TransactionList from '@/components/transactions/TransactionList';
import { useTransactionHistory } from '@/hooks/useTransactionHistory';

export default function TransactionHistoryPage() {
  const {
    transactions,
    totalCount,
    currentPage,
    hasNextPage,
    hasPrevPage,
    isLoading,
    error,
    filters,
    applyFilters,
    goToPage,
    retry,
  } = useTransactionHistory();

  return (
    <main className="px-6 py-8">
      <div className="space-y-6">
        <header className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <div className="inline-flex items-center gap-2">
            <History className="h-5 w-5 text-info" />
            <h1 className="text-h1 font-bold text-fg">Historial de transacciones</h1>
          </div>
          <p className="mt-2 text-sm text-muted-fg">
            Consulta tus transacciones completadas y califica tu experiencia.
          </p>
        </header>

        <TransactionFiltersPanel filters={filters} onApply={applyFilters} />

        <TransactionList
          transactions={transactions}
          isLoading={isLoading}
          error={error}
          totalCount={totalCount}
          currentPage={currentPage}
          hasNextPage={hasNextPage}
          hasPrevPage={hasPrevPage}
          onRetry={retry}
          onPageChange={goToPage}
        />
      </div>
    </main>
  );
}
