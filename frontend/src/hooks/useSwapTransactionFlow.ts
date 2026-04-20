import { useCallback, useState } from 'react';

import {
  decideSwapAgenda,
  decideSwapProposal,
  proposeSwapAgenda,
  updateSwapProposal,
} from '@/lib/api';

import type { Transaction } from '@/types/transaction';

export function useSwapTransactionFlow() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAction = useCallback(async (action: () => Promise<Transaction>) => {
    setIsLoading(true);
    setError(null);
    try {
      return await action();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo actualizar el intercambio';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateProposal = useCallback(
    async (transactionId: number, proposedProductId: number) =>
      runAction(() =>
        updateSwapProposal(transactionId, {
          proposed_product_id: proposedProductId,
        }),
      ),
    [runAction],
  );

  const decideProposal = useCallback(
    async (transactionId: number, accepted: boolean) =>
      runAction(() => decideSwapProposal(transactionId, { accepted })),
    [runAction],
  );

  const updateAgenda = useCallback(
    async (transactionId: number, deliveryLocation: string, deliveryDate: Date) =>
      runAction(() =>
        proposeSwapAgenda(transactionId, {
          delivery_location: deliveryLocation,
          delivery_date: deliveryDate.toISOString(),
        }),
      ),
    [runAction],
  );

  const decideAgenda = useCallback(
    async (transactionId: number, accepted: boolean) =>
      runAction(() => decideSwapAgenda(transactionId, { accepted })),
    [runAction],
  );

  return {
    isLoading,
    error,
    updateProposal,
    decideProposal,
    updateAgenda,
    decideAgenda,
  };
}
