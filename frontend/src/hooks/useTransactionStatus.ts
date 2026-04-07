import { useCallback, useState } from 'react';

import { updateTransactionStatus } from '@/lib/api';

import type {
  Transaction,
  UpdatableTransactionStatus,
  UpdateTransactionStatusPayload,
} from '@/types/transaction';

export function useTransactionStatus() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const changeStatus = useCallback(
    async (
      transactionId: number,
      status: UpdatableTransactionStatus,
    ): Promise<Transaction | null> => {
      setIsLoading(true);
      setError(null);

      const payload: UpdateTransactionStatusPayload = { status };

      try {
        return await updateTransactionStatus(transactionId, payload);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'No se pudo actualizar el estado';
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    changeStatus,
    isLoading,
    error,
  };
}
