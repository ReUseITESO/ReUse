import { ArrowRightLeft } from 'lucide-react';

import SwapProductPreview from '@/components/transactions/swapFlow/SwapProductPreview';

import type { TransactionProductSummary } from '@/types/transaction';

interface SwapProposalAlertProps {
  swapProduct: TransactionProductSummary | null;
}

export default function SwapProposalAlert({ swapProduct }: SwapProposalAlertProps) {
  return (
    <div className="rounded-md border border-warning/30 bg-warning/10 px-3 py-2">
      <div className="flex items-center justify-between gap-2">
        <p className="inline-flex items-center gap-1.5 text-xs font-medium text-warning-fg">
          <ArrowRightLeft className="h-3.5 w-3.5" />
          Propuesta de intercambio activa
        </p>
        <span className="rounded-full border border-warning/30 bg-card px-2 py-0.5 text-[11px] text-warning-fg">
          Revisión pendiente
        </span>
      </div>

      {swapProduct && (
        <div className="mt-1.5">
          <SwapProductPreview product={swapProduct} compact />
        </div>
      )}
    </div>
  );
}
