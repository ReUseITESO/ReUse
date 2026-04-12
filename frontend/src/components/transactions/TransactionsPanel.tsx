'use client';

import { useState } from 'react';

import TransactionCard from '@/components/transactions/TransactionCard';
import TransactionsFilters from '@/components/transactions/TransactionsFilters';
import TransactionsPagination from '@/components/transactions/TransactionsPagination';
import EmptyState from '@/components/ui/EmptyState';
import ErrorMessage from '@/components/ui/ErrorMessage';
import Spinner from '@/components/ui/Spinner';
import { useAuth } from '@/hooks/useAuth';
import { useTransactions } from '@/hooks/useTransactions';
import { useTransactionStatus } from '@/hooks/useTransactionStatus';

import type { TransactionStatus, UpdatableTransactionStatus } from '@/types/transaction';

export default function TransactionsPanel() {
  const { user, isAuthenticated } = useAuth();
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  // Default to 'pendiente' as requested (merge pendiente + confirmada on the API call)
  const [status, setStatus] = useState<TransactionStatus | undefined>('pendiente');
  const [notice, setNotice] = useState<string | null>(null);

  const {
    transactions,
    totalCount,
    currentPage,
    hasNextPage,
    hasPrevPage,
    isLoading,
    error,
    fetchTransactions,
  } = useTransactions({ role, status });

  // Client-side role counters (approx based on loaded items)
  const buyerCount = transactions.filter(t => t.buyer.id === user?.id).length;
  const sellerCount = transactions.filter(t => t.seller.id === user?.id).length;

  const { changeStatus, isLoading: isUpdatingStatus, error: updateError } = useTransactionStatus();

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-md rounded-lg border border-warning/20 bg-warning/5 p-8 text-center">
        <p className="text-body font-medium text-fg">Inicia sesión para ver tus transacciones</p>
      </div>
    );
  }

  async function handleStatusChange(
    transactionId: number,
    targetStatus: UpdatableTransactionStatus,
  ) {
    const updated = await changeStatus(transactionId, targetStatus);
    if (!updated) {
      return;
    }

    setNotice('Notificación pendiente: CORE enviará avisos en una siguiente integración.');
    fetchTransactions(currentPage);
  }

  return (
    <section className="space-y-5">
      <TransactionsFilters
        role={role}
        status={status}
        buyerCount={buyerCount}
        sellerCount={sellerCount}
        onRoleChange={nextRole => {
          setRole(nextRole);
        }}
        onStatusChange={nextStatus => {
          setStatus(nextStatus);
        }}
      />

      {notice && (
        <div className="rounded-lg border border-info/30 bg-info/10 px-4 py-3 text-sm text-info">
          {notice}
        </div>
      )}

      {(error || updateError) && (
        <ErrorMessage
          message={error || updateError || 'Error no controlado'}
          onRetry={() => fetchTransactions(currentPage)}
        />
      )}

      {isLoading ? (
        <Spinner />
      ) : transactions.length === 0 ? (
        <EmptyState message="No tienes transacciones para este filtro." />
      ) : (
        <div className="space-y-4">
          {transactions.map(transaction => (
            <TransactionCard
              key={transaction.id}
              transaction={transaction}
              userId={user!.id}
              isUpdatingStatus={isUpdatingStatus}
              onStatusChange={handleStatusChange}
            />
          ))}

          {(hasNextPage || hasPrevPage) && (
            <TransactionsPagination
              currentPage={currentPage}
              totalCount={totalCount}
              hasNextPage={hasNextPage}
              hasPrevPage={hasPrevPage}
              onPrevious={() => fetchTransactions(currentPage - 1)}
              onNext={() => fetchTransactions(currentPage + 1)}
            />
          )}
        </div>
      )}
    </section>
  );
}
