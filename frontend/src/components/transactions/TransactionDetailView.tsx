'use client';

import Link from 'next/link';
import { ArrowLeft, CalendarClock, MapPin, UserRound } from 'lucide-react';

import TransactionLocationHighlight from '@/components/transactions/TransactionLocationHighlight';
import TransactionStatusActions from '@/components/transactions/TransactionStatusActions';
import TransactionStatusBadge from '@/components/transactions/TransactionStatusBadge';
import SwapProposalStatus from '@/components/transactions/swap-transactions/SwapProposalStatus';
import SwapProductPreview from '@/components/transactions/swap-transactions/SwapProductPreview';
import { cn } from '@/lib/utils';
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
    proposeSwap,
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
      // #TODO: CORE - Implementar notificaciones para cambio de estado de transacción (completada/confirmada/cancelada).
      refetch();
    }
  }

  async function handleRespondProposal(accept: boolean) {
    const updated = await respondProposal(transactionIdValue, accept);
    if (updated) {
      // #TODO: CORE - Implementar notificación para respuesta de propuesta de artículo de intercambio (aceptada/rechazada).
      refetch();
    }
  }

  async function handleProposeSwap(productId: number) {
    const updated = await proposeSwap(transactionIdValue, productId);
    if (updated) {
      // #TODO: CORE - Implementar notificación cuando el comprador vuelve a proponer un artículo tras un rechazo.
      refetch();
    }
  }

  async function handleProposeAgenda(location: string, date: Date) {
    const updated = await proposeAgenda(transactionIdValue, location, date.toISOString());
    if (updated) {
      // #TODO: CORE - Implementar notificación cuando se propone una nueva fecha y lugar.
      refetch();
    }
  }

  async function handleRespondAgenda(accept: boolean) {
    const updated = await respondAgenda(transactionIdValue, accept);
    if (updated) {
      // #TODO: CORE - Implementar notificación cuando se responde a la agenda propuesta (aceptada/rechazada).
      refetch();
    }
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

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-3 rounded-xl border border-border bg-muted/30 p-4">
            <p className="flex items-center gap-3 text-sm text-muted-fg">
              <MapPin className="h-4 w-4 text-info" />
              <TransactionLocationHighlight
                location={transaction.delivery_location}
                deliveryDate={transaction.delivery_date}
              />
            </p>
            <p className="flex items-center gap-3 text-sm text-muted-fg">
              <CalendarClock className="h-4 w-4 text-warning" />
              <span>
                Expira:{' '}
                {new Date(transaction.expires_at).toLocaleString('es-MX', { hour12: false })}
              </span>
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col justify-center rounded-xl border border-border bg-card p-3 shadow-sm">
              <div className="flex justify-between items-center mb-1">
                <p className="text-[10px] font-bold text-muted-fg uppercase tracking-widest">
                  Vendedor
                </p>
                <span
                  className={cn(
                    'text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border',
                    transaction.seller_confirmation
                      ? 'bg-success/10 text-success border-success/30'
                      : 'bg-warning/10 text-warning border-warning/30',
                  )}
                >
                  {transaction.seller_confirmation ? 'Confirmado' : 'Pendiente'}
                </span>
              </div>
              <p className="flex items-center gap-2 text-sm font-medium text-fg">
                <UserRound className="h-4 w-4 text-accent" />
                {transaction.seller.first_name} {transaction.seller.last_name}
              </p>
            </div>
            <div className="flex flex-col justify-center rounded-xl border border-border bg-card p-3 shadow-sm">
              <div className="flex justify-between items-center mb-1">
                <p className="text-[10px] font-bold text-muted-fg uppercase tracking-widest">
                  Comprador
                </p>
                <span
                  className={cn(
                    'text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border',
                    transaction.buyer_confirmation
                      ? 'bg-success/10 text-success border-success/30'
                      : 'bg-warning/10 text-warning border-warning/30',
                  )}
                >
                  {transaction.buyer_confirmation ? 'Confirmado' : 'Pendiente'}
                </span>
              </div>
              <p className="flex items-center gap-2 text-sm font-medium text-fg">
                <UserRound className="h-4 w-4 text-secondary" />
                {transaction.buyer.first_name} {transaction.buyer.last_name}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
          <SwapProductPreview
            product={transaction.product}
            label={
              transaction.transaction_type === 'swap'
                ? `Producto solicitado (publicado por ${transaction.seller.first_name})`
                : `Producto publicado por ${transaction.seller.first_name} ${transaction.seller.last_name}`
            }
            showDescription={true}
          />
          {transaction.transaction_type === 'swap' && transaction.swap_data && (
            <SwapProductPreview
              product={transaction.swap_data.proposed_product}
              label={`Producto propuesto (publicado por ${transaction.buyer.first_name})`}
              showDescription={true}
            />
          )}
        </div>

        {transaction.swap_data && (
          <SwapProposalStatus
            swapData={transaction.swap_data}
            actorRole={actorRole}
            deliveryDate={transaction.delivery_date}
            isLoading={isSwapLoading}
            error={swapError}
            onRespondProposal={handleRespondProposal}
            onProposeProduct={handleProposeSwap}
            onProposeAgenda={handleProposeAgenda}
            onRespondAgenda={handleRespondAgenda}
          />
        )}

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

        <p className="text-xs text-muted-fg">Notificación pendiente: integración con CORE.</p>

        {updateError && <p className="text-sm text-error">{updateError}</p>}
      </div>
    </section>
  );
}
