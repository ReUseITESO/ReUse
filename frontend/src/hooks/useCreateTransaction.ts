import { useCallback, useState } from 'react';

import { createTransaction } from '@/lib/api';

import type { CreateTransactionPayload, Transaction } from '@/types/transaction';

export function useCreateTransaction() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(
    async (payload: CreateTransactionPayload): Promise<Transaction | null> => {
      setIsLoading(true);
      setError(null);

      try {
        return await createTransaction(payload);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'No se pudo crear la solicitud de transacción';
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    create,
    isLoading,
    error,
  };
}
