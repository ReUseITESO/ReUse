import { AlertCircle } from 'lucide-react';

import TransactionDetailView from '@/components/transactions/TransactionDetailView';

interface TransactionDetailPageContentProps {
  transactionIdParam: string;
}

export default function TransactionDetailPageContent({
  transactionIdParam,
}: TransactionDetailPageContentProps) {
  const transactionId = Number(transactionIdParam);

  if (Number.isNaN(transactionId) || transactionId <= 0) {
    return (
      <main className="py-12">
        <p className="inline-flex items-center gap-2 rounded-lg border border-error/30 bg-error/10 px-3 py-2 text-sm text-error">
          <AlertCircle className="h-4 w-4" />
          El identificador de transacción no es válido.
        </p>
      </main>
    );
  }

  return (
    <main className="space-y-6 py-8">
      <TransactionDetailView transactionId={transactionId} />
    </main>
  );
}
