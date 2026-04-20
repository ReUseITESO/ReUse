import Link from 'next/link';
import { CalendarClock, MapPin, User, UserRoundCheck } from 'lucide-react';

import SwapProductsSnapshot from '@/components/transactions/swap/SwapProductsSnapshot';
import TransactionLocationHighlight from '@/components/transactions/TransactionLocationHighlight';
import TransactionStatusBadge from '@/components/transactions/TransactionStatusBadge';
import {
  getDeliveryConfirmationLabel,
  getPendingCounterpartLabel,
  getActorRole,
  getTransactionTypeLabel,
  hasActorConfirmed,
  shouldAllowStatusChange,
} from '@/components/transactions/transactionsConfig';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { getTransactionTypeStyle } from '@/lib/productStyles';
import { formatPrice } from '@/lib/utils';

import type { Transaction, UpdatableTransactionStatus } from '@/types/transaction';

interface TransactionCardProps {
  transaction: Transaction;
  userId: number;
  isUpdatingStatus: boolean;
  onStatusChange: (transactionId: number, status: UpdatableTransactionStatus) => Promise<void>;
}

export default function TransactionCard({
  transaction,
  userId,
  isUpdatingStatus,
  onStatusChange,
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

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href={`/products/${transaction.product.id}`}
            className="text-h3 font-semibold text-fg hover:text-primary"
          >
            {transaction.product.title}
          </Link>
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
          {transaction.buyer.first_name} {transaction.buyer.last_name}
        </p>
        <p className="flex items-center gap-2">
          <UserRoundCheck className="h-4 w-4 text-accent" />
          {transaction.seller.first_name} {transaction.seller.last_name}
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
        <SwapProductsSnapshot transaction={transaction} />
      )}

      <div className="flex flex-wrap items-center gap-2">
        {canAccept && (
          <Button
            variant="primary"
            disabled={isUpdatingStatus}
            onClick={() => onStatusChange(transaction.id, 'confirmada')}
          >
            Confirmar solicitud
          </Button>
        )}
        {canConfirmDelivery && (
          <Button
            variant="success"
            disabled={isUpdatingStatus}
            onClick={() => onStatusChange(transaction.id, 'completada')}
          >
            {confirmDeliveryLabel}
          </Button>
        )}
        {canCancel && (
          <Button
            variant="danger-outline"
            disabled={isUpdatingStatus}
            onClick={() => onStatusChange(transaction.id, 'cancelada')}
          >
            Cancelar
          </Button>
        )}
        {showWaitingConfirmation && (
          <Button
            variant="template"
            disabled
            className="border-info/40 bg-info/10 text-info hover:bg-info/10"
          >
            Esperando confirmación de {pendingCounterpart}
          </Button>
        )}
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
