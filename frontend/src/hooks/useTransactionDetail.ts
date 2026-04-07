import { useCallback, useEffect, useState } from 'react';

import { getTransactionById } from '@/lib/api';

import type { Transaction } from '@/types/transaction';

export function useTransactionDetail(transactionId: number | null) {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransaction = useCallback(async () => {
    if (!transactionId) {
      setTransaction(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getTransactionById(transactionId);
      setTransaction(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'No se pudo cargar el detalle de la transacción';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, [transactionId]);

  useEffect(() => {
    fetchTransaction();
  }, [fetchTransaction]);

  return {
    transaction,
    isLoading,
    error,
    refetch: fetchTransaction,
  };
}
