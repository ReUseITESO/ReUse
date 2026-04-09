import { useCallback, useState } from 'react';

import {
  markSwapNoAccept,
  proposeSwapMeeting,
  respondSwapMeeting,
  updateSwapProposal,
} from '@/lib/api';

import type { SwapMeetingProposalPayload, Transaction } from '@/types/transaction';

export function useSwapTransactionStatus() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reproposeSwap = useCallback(async (transactionId: number, swapProductId: number) => {
    setIsLoading(true);
    setError(null);

    try {
      return await updateSwapProposal(transactionId, { swap_product_id: swapProductId });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo reproponer intercambio';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const noAcceptSwap = useCallback(async (transactionId: number): Promise<Transaction | null> => {
    setIsLoading(true);
    setError(null);

    try {
      return await markSwapNoAccept(transactionId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo marcar como no aceptado';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const proposeMeeting = useCallback(
    async (
      transactionId: number,
      payload: SwapMeetingProposalPayload,
    ): Promise<Transaction | null> => {
      setIsLoading(true);
      setError(null);

      try {
        return await proposeSwapMeeting(transactionId, payload);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'No se pudo proponer la agenda';
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const respondMeeting = useCallback(
    async (transactionId: number, accepted: boolean): Promise<Transaction | null> => {
      setIsLoading(true);
      setError(null);

      try {
        return await respondSwapMeeting(transactionId, { accepted });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'No se pudo responder la agenda';
        setError(message);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    reproposeSwap,
    noAcceptSwap,
    proposeMeeting,
    respondMeeting,
    isLoading,
    error,
  };
}
