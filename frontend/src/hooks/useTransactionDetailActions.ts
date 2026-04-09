import { useCallback, useMemo } from 'react';

import { useSwapTransactionStatus } from '@/hooks/useSwapTransactionStatus';
import { useTransactionStatus } from '@/hooks/useTransactionStatus';

import type { UpdatableTransactionStatus } from '@/types/transaction';

interface UseTransactionDetailActionsProps {
  transactionId: number;
  refetch: () => void;
}

export function useTransactionDetailActions({
  transactionId,
  refetch,
}: UseTransactionDetailActionsProps) {
  const {
    changeStatus,
    isLoading: isUpdatingStatus,
    error: updateStatusError,
  } = useTransactionStatus();

  const {
    noAcceptSwap,
    proposeMeeting,
    reproposeSwap,
    respondMeeting,
    isLoading: isUpdatingSwap,
    error: updateSwapError,
  } = useSwapTransactionStatus();

  const isUpdating = isUpdatingStatus || isUpdatingSwap;
  const updateError = useMemo(() => updateStatusError || updateSwapError, [
    updateStatusError,
    updateSwapError,
  ]);

  const handleChangeStatus = useCallback(
    async (status: UpdatableTransactionStatus) => {
      const updated = await changeStatus(transactionId, status);
      if (updated) {
        refetch();
      }
    },
    [changeStatus, refetch, transactionId],
  );

  const handleNoAcceptSwap = useCallback(async () => {
    const updated = await noAcceptSwap(transactionId);
    if (updated) {
      refetch();
    }
  }, [noAcceptSwap, refetch, transactionId]);

  const handleReproposeSwap = useCallback(
    async (swapProductId: number) => {
      const updated = await reproposeSwap(transactionId, swapProductId);
      if (updated) {
        refetch();
      }
    },
    [refetch, reproposeSwap, transactionId],
  );

  const handleProposeMeeting = useCallback(
    async (deliveryLocation: string, deliveryDate: Date) => {
      const updated = await proposeMeeting(transactionId, {
        delivery_location: deliveryLocation,
        delivery_date: deliveryDate.toISOString(),
      });
      if (updated) {
        refetch();
      }
    },
    [proposeMeeting, refetch, transactionId],
  );

  const handleRespondMeeting = useCallback(
    async (accepted: boolean) => {
      const updated = await respondMeeting(transactionId, accepted);
      if (updated) {
        refetch();
      }
    },
    [refetch, respondMeeting, transactionId],
  );

  return {
    isUpdating,
    updateError,
    handleChangeStatus,
    handleNoAcceptSwap,
    handleReproposeSwap,
    handleProposeMeeting,
    handleRespondMeeting,
  };
}
