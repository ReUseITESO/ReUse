'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CalendarClock, MapPin, Package, UserRound } from 'lucide-react';

import SwapAgendaModal from '@/components/transactions/swap/SwapAgendaModal';
import SwapProductProposalModal from '@/components/transactions/swap/SwapProductProposalModal';
import SwapStagePanel from '@/components/transactions/swap/SwapStagePanel';
import TransactionDeliveryConfirmations from '@/components/transactions/TransactionDeliveryConfirmations';
import TransactionLocationHighlight from '@/components/transactions/TransactionLocationHighlight';
import TransactionProductSection from '@/components/transactions/TransactionProductSection';
import TransactionStatusActions from '@/components/transactions/TransactionStatusActions';
import TransactionStatusBadge from '@/components/transactions/TransactionStatusBadge';
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
import { useSwapTransactionFlow } from '@/hooks/useSwapTransactionFlow';
import type { UpdatableTransactionStatus } from '@/types/transaction';

interface TransactionDetailViewProps {
  transactionId: number;
}

export default function TransactionDetailView({ transactionId }: TransactionDetailViewProps) {
  const { user } = useAuth();
  const [isReproposalModalOpen, setIsReproposalModalOpen] = useState(false);
  const [isAgendaModalOpen, setIsAgendaModalOpen] = useState(false);
  const { transaction, isLoading, error, refetch } = useTransactionDetail(transactionId);
  const { changeStatus, isLoading: isUpdating, error: updateError } = useTransactionStatus();
  const {
    isLoading: isUpdatingSwap,
    error: swapError,
    decideAgenda,
    decideProposal,
    updateAgenda,
    updateProposal,
  } = useSwapTransactionFlow();

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
  const isSwapPendingFlow =
    transaction.transaction_type === 'swap' &&
    transaction.status === 'pendiente' &&
    Boolean(transaction.swap_stage);
  const canAccept =
    shouldAllowStatusChange(transaction, actorRole, 'confirmada') && !isSwapPendingFlow;
  const canCancel = shouldAllowStatusChange(transaction, actorRole, 'cancelada');
  const canConfirmDelivery = shouldAllowStatusChange(transaction, actorRole, 'completada');
  const confirmDeliveryLabel = getDeliveryConfirmationLabel(actorRole);
  const actorAlreadyConfirmed = hasActorConfirmed(transaction, actorRole);
  const pendingCounterpart = getPendingCounterpartLabel(transaction);
  const showWaitingConfirmation =
    transaction.status === 'confirmada' && actorAlreadyConfirmed && pendingCounterpart;
  const transactionIdValue = transaction.id;
  const sellerName = `${transaction.seller.first_name} ${transaction.seller.last_name}`.trim();
  const buyerName = `${transaction.buyer.first_name} ${transaction.buyer.last_name}`.trim();

  async function handleChangeStatus(status: UpdatableTransactionStatus) {
    const updated = await changeStatus(transactionIdValue, status);
    if (updated) {
      refetch();
    }
  }

  async function handleReproposal(proposedProductId: number) {
    const updated = await updateProposal(transactionIdValue, proposedProductId);
    if (updated) {
      setIsReproposalModalOpen(false);
      refetch();
    }
  }

  async function handleProposalDecision(accepted: boolean) {
    const updated = await decideProposal(transactionIdValue, accepted);
    if (updated) {
      refetch();
    }
  }

  async function handleAgendaProposal(deliveryLocation: string, deliveryDate: Date) {
    const updated = await updateAgenda(transactionIdValue, deliveryLocation, deliveryDate);
    if (updated) {
      setIsAgendaModalOpen(false);
      refetch();
    }
  }

  async function handleAgendaDecision(accepted: boolean) {
    const updated = await decideAgenda(transactionIdValue, accepted);
    if (updated) {
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

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm text-fg">
            <p className="inline-flex items-center gap-2 font-medium">
              <Package className="h-4 w-4 text-secondary" />
              {transaction.product.title}
            </p>
            <p></p>
            <p className="mt-2 inline-flex items-center gap-2 text-muted-fg">
              <MapPin className="h-4 w-4 text-info" />
              <TransactionLocationHighlight
                location={transaction.delivery_location}
                deliveryDate={transaction.delivery_date}
              />
            </p>
            <p></p>
            <p className="mt-2 inline-flex items-center gap-2 text-muted-fg">
              <CalendarClock className="h-4 w-4 text-warning" />
              Límite: {new Date(transaction.expires_at).toLocaleString('es-MX', { hour12: false })}
            </p>
          </div>

          <div className="space-y-2">
            <div className="rounded-lg border border-border bg-card p-2.5">
              <p className="inline-flex items-center gap-2 text-muted-fg">
                <UserRound className="h-4 w-4 text-accent" />
                Vendedor: {sellerName}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-2.5">
              <p className="inline-flex items-center gap-2 text-muted-fg">
                <UserRound className="h-4 w-4 text-secondary" />
                Comprador: {buyerName}
              </p>
            </div>
          </div>
        </div>

        <TransactionDeliveryConfirmations
          sellerConfirmation={transaction.seller_confirmation}
          buyerConfirmation={transaction.buyer_confirmation}
          sellerName={sellerName}
          buyerName={buyerName}
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

        {isSwapPendingFlow && (
          <SwapStagePanel
            transaction={transaction}
            actorRole={actorRole}
            isUpdating={isUpdatingSwap}
            onRepropose={() => setIsReproposalModalOpen(true)}
            onOpenAgenda={() => setIsAgendaModalOpen(true)}
            onDecideProposal={handleProposalDecision}
            onDecideAgenda={handleAgendaDecision}
          />
        )}

        <TransactionProductSection
          product={transaction.product}
          title={
            transaction.transaction_type === 'swap'
              ? `Producto publicado por ${sellerName}`
              : 'Producto de la transacción'
          }
        />

        {transaction.transaction_type === 'swap' && transaction.proposed_product && (
          <TransactionProductSection
            product={transaction.proposed_product}
            title={`Producto propuesto por ${buyerName}`}
          />
        )}

        <p className="text-xs text-muted-fg">Notificación pendiente: integración con CORE.</p>

        {(updateError || swapError) && (
          <p className="text-sm text-error">{updateError || swapError}</p>
        )}
      </div>

      <SwapProductProposalModal
        isOpen={isReproposalModalOpen}
        isSubmitting={isUpdatingSwap}
        submitError={swapError}
        onClose={() => setIsReproposalModalOpen(false)}
        onSubmit={handleReproposal}
      />

      <SwapAgendaModal
        isOpen={isAgendaModalOpen}
        isLoading={isUpdatingSwap}
        error={swapError}
        onCancel={() => setIsAgendaModalOpen(false)}
        onSubmit={handleAgendaProposal}
      />
    </section>
  );
}
