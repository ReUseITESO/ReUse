'use client';

import TransactionDetailSummary from '@/components/transactions/detail/TransactionDetailSummary';
import SwapMeetingPlanner from '@/components/transactions/swapFlow/SwapMeetingPlanner';
import SwapPendingPanel from '@/components/transactions/swapFlow/SwapPendingPanel';
import TransactionDeliveryConfirmations from '@/components/transactions/TransactionDeliveryConfirmations';
import TransactionProductSection from '@/components/transactions/TransactionProductSection';
import TransactionStatusActions from '@/components/transactions/TransactionStatusActions';
import {
  getDeliveryConfirmationLabel,
  getPendingCounterpartLabel,
  hasActorConfirmed,
  shouldAllowStatusChange,
} from '@/components/transactions/transactionsConfig';
import ErrorMessage from '@/components/ui/ErrorMessage';
import Spinner from '@/components/ui/Spinner';
import { useAuth } from '@/hooks/useAuth';
import { useTransactionDetailActions } from '@/hooks/useTransactionDetailActions';
import { useTransactionDetail } from '@/hooks/useTransactionDetail';

interface TransactionDetailViewProps {
  transactionId: number;
}

export default function TransactionDetailView({ transactionId }: TransactionDetailViewProps) {
  const { user } = useAuth();
  const { transaction, isLoading, error, refetch } = useTransactionDetail(transactionId);
  const {
    isUpdating,
    updateError,
    handleChangeStatus,
    handleNoAcceptSwap,
    handleReproposeSwap,
    handleProposeMeeting,
    handleRespondMeeting,
  } = useTransactionDetailActions({ transactionId, refetch });

  if (isLoading) {
    return <Spinner />;
  }

  if (error || !transaction) {
    return (
      <ErrorMessage
        message={error || 'No se pudo cargar la transacción solicitada.'}
        onRetry={refetch}
      />
    );
  }

  const actorRole = transaction.seller.id === user?.id ? 'seller' : 'buyer';
  const canAccept = shouldAllowStatusChange(transaction, actorRole, 'confirmada');
  const canCancel = shouldAllowStatusChange(transaction, actorRole, 'cancelada');
  const canConfirmDelivery = shouldAllowStatusChange(transaction, actorRole, 'completada');
  const confirmDeliveryLabel = getDeliveryConfirmationLabel(actorRole);
  const actorAlreadyConfirmed = hasActorConfirmed(transaction, actorRole);
  const pendingCounterpart = getPendingCounterpartLabel(transaction);
  const showWaitingConfirmation =
    transaction.status === 'confirmada' && actorAlreadyConfirmed && pendingCounterpart;
  const canNoAcceptSwap =
    transaction.transaction_type === 'swap' &&
    transaction.status === 'pendiente' &&
    actorRole === 'seller';

  return (
    <section className="space-y-5">
      <div className="space-y-5">
        <TransactionDetailSummary transaction={transaction} />

        <TransactionDeliveryConfirmations
          sellerConfirmation={transaction.seller_confirmation}
          buyerConfirmation={transaction.buyer_confirmation}
        />

        <TransactionStatusActions
          canAccept={canAccept}
          canCancel={canCancel}
          canConfirmDelivery={canConfirmDelivery}
          canNoAcceptSwap={canNoAcceptSwap}
          showWaitingConfirmation={Boolean(showWaitingConfirmation)}
          pendingCounterpart={pendingCounterpart}
          confirmDeliveryLabel={confirmDeliveryLabel}
          isUpdating={isUpdating}
          onChangeStatus={handleChangeStatus}
          onNoAcceptSwap={handleNoAcceptSwap}
        />

        {transaction.transaction_type === 'swap' && transaction.status === 'pendiente' && (
          <SwapPendingPanel
            transaction={transaction}
            actorRole={actorRole}
            isUpdating={isUpdating}
            onReproposeSwap={handleReproposeSwap}
            onNoAcceptSwap={handleNoAcceptSwap}
          />
        )}

        {transaction.transaction_type === 'swap' && transaction.status === 'confirmada' && (
          <SwapMeetingPlanner
            transaction={transaction}
            actorRole={actorRole}
            isUpdating={isUpdating}
            onProposeMeeting={handleProposeMeeting}
            onRespondMeeting={handleRespondMeeting}
          />
        )}

        <TransactionProductSection product={transaction.product} />

        <p className="text-xs text-muted-fg">Notificación pendiente: integración con CORE.</p>

        {updateError && <p className="text-sm text-error">{updateError}</p>}
      </div>
    </section>
  );
}
