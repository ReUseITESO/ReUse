import Link from 'next/link';
import { CalendarClock, MapPin, User, UserRoundCheck } from 'lucide-react';
import CategoryPlaceholderIcon from '@/components/products/CategoryPlaceholderIcon';

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
import ProductBadge from '@/components/ui/ProductBadge';
import { getCategoryStyle, getTransactionTypeStyle } from '@/lib/productStyles';
import { formatPrice } from '@/lib/utils';
import SwapProductPreview from '@/components/transactions/swap-transactions/SwapProductPreview';

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
  const categoryStyle = getCategoryStyle(transaction.product.category.name);

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-2">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${categoryStyle}`}>
            <CategoryPlaceholderIcon
              categoryName={transaction.product.category.name}
              className="h-6 w-6"
            />
          </div>
          <div>
            <h3 className="text-xl font-bold text-fg tracking-tight">{transaction.product.title}</h3>
            <p className="text-sm text-muted-fg font-medium">
              {transaction.transaction_type === 'sale'
                ? formatPrice(transaction.product.price)
                : typeLabel}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ProductBadge label={typeLabel} className={typeClass} />
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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <SwapProductPreview
          product={transaction.product}
          label={`Producto publicado por ${transaction.seller.first_name} ${transaction.seller.last_name}`}
        />
        {transaction.transaction_type === 'swap' && transaction.swap_data && (
          <SwapProductPreview
            product={transaction.swap_data.proposed_product}
            label={`Producto propuesto por ${transaction.buyer.first_name} ${transaction.buyer.last_name}`}
          />
        )}
      </div>

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
    </Card >
  );
}
