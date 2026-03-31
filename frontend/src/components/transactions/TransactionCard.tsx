import Link from 'next/link';
import { CalendarClock, MapPin, RefreshCcw, User, UserRoundCheck } from 'lucide-react';

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
          <h3 className="text-h3 font-semibold text-fg">{transaction.product.title}</h3>
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
          <TransactionLocationHighlight location={transaction.delivery_location} showPrefix />
        </p>
        <p className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-warning" />
          Expira: {new Date(transaction.expires_at).toLocaleString('es-MX', { hour12: false })}
        </p>
      </div>

      {transaction.transaction_type === 'swap' && (
        <p className="rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning-fg">
          <RefreshCcw className="mr-2 inline h-3 w-3" />
          TODO: flujo completo de intercambio pendiente (issue #34).
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {canAccept && (
          <Button
            variant="primary"
            disabled={isUpdatingStatus}
            onClick={() => onStatusChange(transaction.id, 'confirmada')}
          >
            Aceptar solicitud
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
        {canConfirmDelivery && (
          <Button
            variant="secondary"
            disabled={isUpdatingStatus}
            onClick={() => onStatusChange(transaction.id, 'completada')}
          >
            {confirmDeliveryLabel}
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
