import { useCallback, useEffect, useState } from 'react';

import { getTransactionHistory } from '@/lib/api';
import type { Transaction, TransactionFilters } from '@/types/transaction';
import type { PaginatedResponse } from '@/types/api';

export function useTransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TransactionFilters>({});

  const fetchTransactions = useCallback(async (activeFilters: TransactionFilters, page = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getTransactionHistory({ ...activeFilters, page }) as PaginatedResponse<Transaction>;
      setTransactions(data.results);
      setTotalCount(data.count);
      setCurrentPage(page);
      setHasNextPage(Boolean(data.next));
      setHasPrevPage(Boolean(data.previous));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar el historial';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions(filters, 1);
  }, [fetchTransactions, filters]);

  const applyFilters = useCallback((newFilters: TransactionFilters) => {
    setFilters(newFilters);
  }, []);

  const goToPage = useCallback(
    (page: number) => {
      fetchTransactions(filters, page);
    },
    [fetchTransactions, filters],
  );

  return {
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
    retry: () => fetchTransactions(filters, currentPage),
  };
}
