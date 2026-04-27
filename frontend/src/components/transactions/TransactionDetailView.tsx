'use client';

import Link from 'next/link';
import { ArrowLeft, CalendarClock, MapPin, Package, UserRound } from 'lucide-react';

import TransactionDeliveryConfirmations from '@/components/transactions/TransactionDeliveryConfirmations';
import TransactionLocationHighlight from '@/components/transactions/TransactionLocationHighlight';
import TransactionProductSection from '@/components/transactions/TransactionProductSection';
import TransactionStatusActions from '@/components/transactions/TransactionStatusActions';
import TransactionStatusBadge from '@/components/transactions/TransactionStatusBadge';
import SwapProposalStatus from '@/components/transactions/swap-transactions/SwapProposalStatus';
import SwapProductPreview from '@/components/transactions/swap-transactions/SwapProductPreview';
import {
  getDeliveryConfirmationLabel,
  getPendingCounterpartLabel,
  hasActorConfirmed,
  shouldAllowStatusChange,
} from '@/components/transactions/transactionsConfig';
import ErrorMessage from '@/components/ui/ErrorMessage';
import Spinner from '@/components/ui/Spinner';
import { useAuth } from '@/hooks/useAuth';
import { useTransactionDetail } from '@/hooks/useTransactionDetail';
import { useTransactionStatus } from '@/hooks/useTransactionStatus';
import { useSwapTransaction } from '@/hooks/useSwapTransaction';
import type { UpdatableTransactionStatus } from '@/types/transaction';

interface TransactionDetailViewProps {
  transactionId: number;
}

export default function TransactionDetailView({ transactionId }: TransactionDetailViewProps) {
  const { user } = useAuth();
  const { transaction, isLoading, error, refetch } = useTransactionDetail(transactionId);
  const { changeStatus, isLoading: isUpdating, error: updateError } = useTransactionStatus();
  const {
    respondProposal,
    proposeAgenda,
    respondAgenda,
    isLoading: isSwapLoading,
    error: swapError,
  } = useSwapTransaction();

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
  const transactionIdValue = transaction.id;

  async function handleChangeStatus(status: UpdatableTransactionStatus) {
    const updated = await changeStatus(transactionIdValue, status);
    if (updated) {
      refetch();
    }
  }

  async function handleRespondProposal(accept: boolean) {
    const updated = await respondProposal(transactionIdValue, accept);
    if (updated) refetch();
  }

  async function handleProposeAgenda(location: string, date: Date) {
    const updated = await proposeAgenda(transactionIdValue, location, date.toISOString());
    if (updated) refetch();
  }

  async function handleRespondAgenda(accept: boolean) {
    const updated = await respondAgenda(transactionIdValue, accept);
    if (updated) refetch();
  }

  return (
    <section className="space-y-5">
      <Link
        href="/transactions"
        className="inline-flex items-center gap-2 rounded-lg border border-input bg-card px-3 py-1.5 text-sm text-muted-fg transition-colors hover:bg-muted hover:text-fg"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a transacciones
      </Link>

      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-h2 font-bold text-fg">Detalle de transacción</h1>
            <p className="text-sm text-muted-fg">Solicitud #{transaction.id}</p>
          </div>
          <TransactionStatusBadge status={transaction.status} />
        </div>

        {transaction.transaction_type === 'swap' && transaction.swap_data ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
            <SwapProductPreview
              product={transaction.product}
              label={`Producto solicitado (publicado por ${transaction.seller.first_name})`}
            />
            <SwapProductPreview
              product={transaction.swap_data.proposed_product}
              label={`Producto propuesto (publicado por ${transaction.buyer.first_name})`}
            />
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm text-fg">
              <p className="inline-flex items-center gap-2 font-medium">
                <Package className="h-4 w-4 text-secondary" />
                {transaction.product.title}
              </p>
              <p className="mt-2 inline-flex items-center gap-2 text-muted-fg">
                <MapPin className="h-4 w-4 text-info" />
                <TransactionLocationHighlight
                  location={transaction.delivery_location}
                  deliveryDate={transaction.delivery_date}
                />
              </p>
              <p className="mt-2 inline-flex items-center gap-2 text-muted-fg">
                <CalendarClock className="h-4 w-4 text-warning" />
                Límite:{' '}
                {new Date(transaction.expires_at).toLocaleString('es-MX', { hour12: false })}
              </p>
            </div>

            <div className="space-y-2">
              <div className="rounded-lg border border-border bg-card p-2.5">
                <p className="inline-flex items-center gap-2 text-muted-fg">
                  <UserRound className="h-4 w-4 text-accent" />
                  Vendedor: {transaction.seller.first_name} {transaction.seller.last_name}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-card p-2.5">
                <p className="inline-flex items-center gap-2 text-muted-fg">
                  <UserRound className="h-4 w-4 text-secondary" />
                  Comprador: {transaction.buyer.first_name} {transaction.buyer.last_name}
                </p>
              </div>
            </div>
          </div>
        )}

        {transaction.swap_data && (
          <SwapProposalStatus
            swapData={transaction.swap_data}
            actorRole={actorRole}
            isLoading={isSwapLoading}
            error={swapError}
            onRespondProposal={handleRespondProposal}
            onProposeAgenda={handleProposeAgenda}
            onRespondAgenda={handleRespondAgenda}
          />
        )}

        <TransactionDeliveryConfirmations
          sellerConfirmation={transaction.seller_confirmation}
          buyerConfirmation={transaction.buyer_confirmation}
        />

        <TransactionStatusActions
          canAccept={canAccept}
          canCancel={canCancel}
          canConfirmDelivery={canConfirmDelivery}
          showWaitingConfirmation={Boolean(showWaitingConfirmation)}
          pendingCounterpart={pendingCounterpart}
          confirmDeliveryLabel={confirmDeliveryLabel}
          isUpdating={isUpdating}
          onChangeStatus={handleChangeStatus}
        />

        <TransactionProductSection product={transaction.product} />

        <p className="text-xs text-muted-fg">Notificación pendiente: integración con CORE.</p>

        {updateError && <p className="text-sm text-error">{updateError}</p>}
      </div>
    </section>
  );
}
