'use client';

import { useState } from 'react';
import { CalendarDays, MapPin, Tag, User, UserRoundCheck } from 'lucide-react';

import StarRating from '@/components/transactions/StarRating';
import TransactionReviewForm from '@/components/transactions/TransactionReviewForm';
import TransactionStatusBadge from '@/components/transactions/TransactionStatusBadge';
import Card from '@/components/ui/Card';
import { getTransactionTypeStyle } from '@/lib/productStyles';
import { formatPrice } from '@/lib/utils';
import type { Transaction, TransactionReview } from '@/types/transaction';

const TYPE_LABELS: Record<string, string> = {
  sale: 'Venta',
  donation: 'Donacion',
  swap: 'Intercambio',
};

export default function TransactionHistoryCard({ transaction }: { transaction: Transaction }) {
  const [canReview, setCanReview] = useState(transaction.can_review ?? false);
  const [myReview, setMyReview] = useState<TransactionReview | null>(transaction.my_review ?? null);
  const [showForm, setShowForm] = useState(false);

  const typeLabel = TYPE_LABELS[transaction.transaction_type] ?? transaction.transaction_type;
  const typeClass = getTransactionTypeStyle(transaction.transaction_type);

  function handleReviewSubmitted(review: TransactionReview) {
    setMyReview(review);
    setCanReview(false);
    setShowForm(false);
  }

  return (
    <Card className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {transaction.product.image_url && (
            <img
              src={transaction.product.image_url}
              alt={transaction.product.title}
              className="h-14 w-14 shrink-0 rounded-xl object-cover"
            />
          )}
          <div>
            <h3 className="text-base font-semibold text-fg">{transaction.product.title}</h3>
            <p className="text-sm text-muted-fg">
              {transaction.transaction_type === 'sale'
                ? formatPrice(transaction.product.price)
                : typeLabel}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-md border px-2 py-1 text-xs font-medium ${typeClass}`}>
            {typeLabel}
          </span>
          <TransactionStatusBadge status={transaction.status} />
        </div>
      </div>

      {/* Details */}
      <div className="grid gap-2 text-sm text-muted-fg sm:grid-cols-2">
        <p className="flex items-center gap-2">
          <User className="h-4 w-4 text-secondary" />
          Comprador: {transaction.buyer.first_name} {transaction.buyer.last_name}
        </p>
        <p className="flex items-center gap-2">
          <UserRoundCheck className="h-4 w-4 text-accent" />
          Vendedor: {transaction.seller.first_name} {transaction.seller.last_name}
        </p>
        {transaction.delivery_location && (
          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-info" />
            {transaction.delivery_location}
          </p>
        )}
        <p className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-muted-fg" />
          {new Date(transaction.created_at).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </p>
        <p className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-muted-fg" />
          {transaction.product.category?.name ?? '—'}
        </p>
      </div>

      {/* Rating section */}
      {myReview ? (
        <div className="border-t border-border pt-3">
          <p className="mb-1 text-xs font-medium text-fg">Tu calificacion</p>
          <StarRating value={myReview.rating} readonly size="sm" />
          {myReview.comment && <p className="mt-1 text-xs text-muted-fg">{myReview.comment}</p>}
        </div>
      ) : canReview && !showForm ? (
        <div className="border-t border-border pt-3">
          <button
            onClick={() => setShowForm(true)}
            className="rounded-xl bg-btn-primary px-4 py-1.5 text-sm font-medium text-btn-primary-fg transition-colors hover:bg-primary-hover"
          >
            Calificar transaccion
          </button>
        </div>
      ) : showForm ? (
        <TransactionReviewForm transactionId={transaction.id} onSubmitted={handleReviewSubmitted} />
      ) : null}
    </Card>
  );
}
