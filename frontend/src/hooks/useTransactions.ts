import { useCallback, useEffect, useRef, useState } from 'react';

import { listTransactions } from '@/lib/api';

import type { Transaction, TransactionStatus } from '@/types/transaction';

interface UseTransactionsFilters {
  role?: 'buyer' | 'seller';
  status?: TransactionStatus;
}

export function useTransactions(filters: UseTransactionsFilters = {}) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestSequenceRef = useRef(0);

  const fetchTransactions = useCallback(
    async (page = 1) => {
      const requestId = requestSequenceRef.current + 1;
      requestSequenceRef.current = requestId;

      setIsLoading(true);
      setError(null);

      try {
        const data = await listTransactions({
          role: filters.role,
          status: filters.status,
          page,
        });

        if (requestId !== requestSequenceRef.current) {
          return;
        }

        setTransactions(data.results);
        setTotalCount(data.count);
        setCurrentPage(page);
        setHasNextPage(Boolean(data.next));
        setHasPrevPage(Boolean(data.previous));
      } catch (err) {
        if (requestId !== requestSequenceRef.current) {
          return;
        }

        const message =
          err instanceof Error ? err.message : 'No se pudieron cargar las transacciones';
        setError(message);
      } finally {
        if (requestId === requestSequenceRef.current) {
          setIsLoading(false);
        }
      }
    },
    [filters.role, filters.status],
  );

  useEffect(() => {
    fetchTransactions(1);
  }, [fetchTransactions]);

  return {
    transactions,
    totalCount,
    currentPage,
    hasNextPage,
    hasPrevPage,
    isLoading,
    error,
    fetchTransactions,
  };
}
