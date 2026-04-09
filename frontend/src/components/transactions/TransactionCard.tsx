import Link from 'next/link';
import { CalendarClock, MapPin, User, UserRoundCheck } from 'lucide-react';

import TransactionLocationHighlight from '@/components/transactions/TransactionLocationHighlight';
import SwapProposalAlert from '@/components/transactions/swapFlow/SwapProposalAlert';
import TransactionStatusActions from '@/components/transactions/TransactionStatusActions';
import TransactionStatusBadge from '@/components/transactions/TransactionStatusBadge';
import {
  getDeliveryConfirmationLabel,
  getPendingCounterpartLabel,
  getActorRole,
  getTransactionTypeLabel,
  hasActorConfirmed,
  shouldAllowStatusChange,
} from '@/components/transactions/transactionsConfig';
import Card from '@/components/ui/Card';
import { getTransactionTypeStyle } from '@/lib/productStyles';
import { formatPrice } from '@/lib/utils';

import type { Transaction, UpdatableTransactionStatus } from '@/types/transaction';

interface TransactionCardProps {
  transaction: Transaction;
  userId: number;
  isUpdatingStatus: boolean;
  onStatusChange: (transactionId: number, status: UpdatableTransactionStatus) => Promise<void>;
  onSwapNoAccept: (transactionId: number) => Promise<void>;
}

export default function TransactionCard({
  transaction,
  userId,
  isUpdatingStatus,
  onStatusChange,
  onSwapNoAccept,
}: TransactionCardProps) {
  const actorRole = getActorRole(transaction, userId);
  const canAccept = shouldAllowStatusChange(transaction, actorRole, 'confirmada');
  const canCancel = shouldAllowStatusChange(transaction, actorRole, 'cancelada');
  const canConfirmDelivery = shouldAllowStatusChange(transaction, actorRole, 'completada');
  const confirmDeliveryLabel = getDeliveryConfirmationLabel(actorRole);
  const actorAlreadyConfirmed = hasActorConfirmed(transaction, actorRole);
  const pendingCounterpart = getPendingCounterpartLabel(transaction);
  const showWaitingConfirmation =
    transaction.status === 'confirmada' && actorAlreadyConfirmed && pendingCounterpart;

  const typeLabel = getTransactionTypeLabel(transaction.transaction_type);
  const typeClass = getTransactionTypeStyle(transaction.transaction_type);
  const canNoAcceptSwap =
    transaction.transaction_type === 'swap' &&
    transaction.status === 'pendiente' &&
    actorRole === 'seller';

  function handleChangeStatus(status: UpdatableTransactionStatus) {
    onStatusChange(transaction.id, status);
  }

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-h3 font-semibold text-fg">
            <Link
              href={`/products/${transaction.product.id}`}
              className="hover:text-primary hover:underline"
            >
              {transaction.product.title}
            </Link>
          </h3>
          <p className="text-sm text-muted-fg">
            {transaction.transaction_type === 'sale'
              ? formatPrice(transaction.product.price)
              : typeLabel}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-md border px-2 py-1 text-xs font-medium ${typeClass}`}>
            {typeLabel}
          </span>
          <TransactionStatusBadge status={transaction.status} />
        </div>
      </div>

      <div className="grid gap-2 text-sm text-muted-fg sm:grid-cols-2">
        <p className="flex items-center gap-2">
          <User className="h-4 w-4 text-secondary" />
          Comprador: {transaction.buyer.first_name} {transaction.buyer.last_name}
        </p>
        <p className="flex items-center gap-2">
          <UserRoundCheck className="h-4 w-4 text-accent" />
          Vendedor: {transaction.seller.first_name} {transaction.seller.last_name}
        </p>
        <p className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-info" />
          <TransactionLocationHighlight
            location={transaction.delivery_location}
            deliveryDate={transaction.delivery_date}
            showPrefix
          />
        </p>
        <p className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-warning" />
          Expira: {new Date(transaction.expires_at).toLocaleString('es-MX', { hour12: false })}
        </p>
      </div>

      {transaction.transaction_type === 'swap' && (
        <SwapProposalAlert swapProduct={transaction.swap_product} />
      )}

      <div className="flex flex-wrap items-center gap-2">
        <TransactionStatusActions
          canAccept={canAccept}
          canCancel={canCancel}
          canConfirmDelivery={canConfirmDelivery}
          canNoAcceptSwap={canNoAcceptSwap}
          showWaitingConfirmation={Boolean(showWaitingConfirmation)}
          pendingCounterpart={pendingCounterpart}
          confirmDeliveryLabel={confirmDeliveryLabel}
          isUpdating={isUpdatingStatus}
          onChangeStatus={handleChangeStatus}
          onNoAcceptSwap={() => onSwapNoAccept(transaction.id)}
        />
        <Link
          href={`/transactions/${transaction.id}`}
          className="rounded-lg border border-input px-3 py-2 text-sm text-fg transition-colors hover:bg-muted"
        >
          Ver detalle
        </Link>
      </div>
    </Card>
  );
}
