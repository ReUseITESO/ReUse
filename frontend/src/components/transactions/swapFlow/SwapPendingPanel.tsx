'use client';

import { useState } from 'react';
import { ArrowRightLeft, RefreshCcw } from 'lucide-react';

import SwapProductPreview from '@/components/transactions/swapFlow/SwapProductPreview';
import SwapProposalSection from '@/components/transactions/swapFlow/SwapProposalSection';
import Button from '@/components/ui/Button';
import type { Transaction } from '@/types/transaction';

interface SwapPendingPanelProps {
  transaction: Transaction;
  actorRole: 'buyer' | 'seller';
  isUpdating: boolean;
  onReproposeSwap: (swapProductId: number) => Promise<void>;
  onNoAcceptSwap: () => Promise<void>;
}

export default function SwapPendingPanel({
  transaction,
  actorRole,
  isUpdating,
  onReproposeSwap,
  onNoAcceptSwap,
}: SwapPendingPanelProps) {
  const [selectedSwapProductId, setSelectedSwapProductId] = useState<number | null>(
    transaction.swap_product?.id ?? null,
  );

  const isBuyer = actorRole === 'buyer';
  const isSeller = actorRole === 'seller';

  return (
    <section className="space-y-3 rounded-lg border border-warning/30 bg-warning/10 p-4">
      <p className="inline-flex items-center gap-2 text-sm font-semibold text-warning-fg">
        <ArrowRightLeft className="h-4 w-4" />
        Propuesta de intercambio
      </p>

      {transaction.swap_product ? (
        <SwapProductPreview product={transaction.swap_product} compact titlePrefix="Te propusieron" />
      ) : (
        <p className="text-sm text-warning-fg">No hay producto propuesto registrado.</p>
      )}

      {isSeller && (
        <Button variant="secondary" disabled={isUpdating} onClick={onNoAcceptSwap}>
          <RefreshCcw className="mr-2 inline h-4 w-4" />
          No aceptar (mantener pendiente)
        </Button>
      )}

      {isBuyer && (
        <>
          <SwapProposalSection
            selectedProductId={selectedSwapProductId}
            disabled={isUpdating}
            onSelectProduct={setSelectedSwapProductId}
          />
          <Button
            variant="secondary"
            disabled={isUpdating || !selectedSwapProductId}
            onClick={() => selectedSwapProductId && onReproposeSwap(selectedSwapProductId)}
          >
            Enviar nueva propuesta
          </Button>
        </>
      )}
    </section>
  );
}
