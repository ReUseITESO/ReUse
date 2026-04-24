import { useCallback, useState } from 'react';

import {
  createSwapProposal,
  proposeSwapAgenda,
  respondSwapAgenda,
  respondSwapProposal,
} from '@/lib/api';
import type { SwapTransactionData } from '@/types/transaction';

export function useSwapTransaction() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function withLoading<T>(fn: () => Promise<T>): Promise<T | null> {
    setIsLoading(true);
    setError(null);
    try {
      return await fn();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error en el intercambio';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  const proposeSwap = useCallback(
    (transactionId: number, proposedProductId: number): Promise<SwapTransactionData | null> =>
      withLoading(() => createSwapProposal(transactionId, proposedProductId)),
    [],
  );

  const respondProposal = useCallback(
    (transactionId: number, accept: boolean): Promise<SwapTransactionData | null> =>
      withLoading(() => respondSwapProposal(transactionId, accept)),
    [],
  );

  const proposeAgenda = useCallback(
    (
      transactionId: number,
      agendaLocation: string,
      deliveryDate: string,
    ): Promise<SwapTransactionData | null> =>
      withLoading(() => proposeSwapAgenda(transactionId, agendaLocation, deliveryDate)),
    [],
  );

  const respondAgenda = useCallback(
    (transactionId: number, accept: boolean): Promise<SwapTransactionData | null> =>
      withLoading(() => respondSwapAgenda(transactionId, accept)),
    [],
  );

  return {
    proposeSwap,
    respondProposal,
    proposeAgenda,
    respondAgenda,
    isLoading,
    error,
  };
}
