import Link from 'next/link';
import { ArrowLeft, CalendarClock, MapPin, Package, UserRound } from 'lucide-react';

import TransactionLocationHighlight from '@/components/transactions/TransactionLocationHighlight';
import TransactionStatusBadge from '@/components/transactions/TransactionStatusBadge';

import type { Transaction } from '@/types/transaction';

interface TransactionDetailSummaryProps {
  transaction: Transaction;
}

export default function TransactionDetailSummary({ transaction }: TransactionDetailSummaryProps) {
  return (
    <>
      <Link
        href="/transactions"
        className="inline-flex items-center gap-2 rounded-lg border border-input bg-card px-3 py-1.5 text-sm text-muted-fg transition-colors hover:bg-muted hover:text-fg"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a transacciones
      </Link>

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
            Límite: {new Date(transaction.expires_at).toLocaleString('es-MX', { hour12: false })}
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

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-h2 font-bold text-fg">Detalle de transacción</h1>
          <p className="text-sm text-muted-fg">Solicitud #{transaction.id}</p>
        </div>
        <TransactionStatusBadge status={transaction.status} />
      </div>
    </>
  );
}
