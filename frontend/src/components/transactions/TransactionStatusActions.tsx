import Button from '@/components/ui/Button';

import type { UpdatableTransactionStatus } from '@/types/transaction';

interface TransactionStatusActionsProps {
  canAccept: boolean;
  canCancel: boolean;
  canConfirmDelivery: boolean;
  canNoAcceptSwap?: boolean;
  showWaitingConfirmation: boolean;
  pendingCounterpart: string | null;
  confirmDeliveryLabel: string;
  isUpdating: boolean;
  onChangeStatus: (status: UpdatableTransactionStatus) => void;
  onNoAcceptSwap?: () => void;
}

export default function TransactionStatusActions({
  canAccept,
  canCancel,
  canConfirmDelivery,
  canNoAcceptSwap = false,
  showWaitingConfirmation,
  pendingCounterpart,
  confirmDeliveryLabel,
  isUpdating,
  onChangeStatus,
  onNoAcceptSwap,
}: TransactionStatusActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {canAccept && (
        <Button
          variant="primary"
          disabled={isUpdating}
          onClick={() => onChangeStatus('confirmada')}
        >
          Aceptar solicitud
        </Button>
      )}

      {canCancel && (
        <Button
          variant="danger-outline"
          disabled={isUpdating}
          onClick={() => onChangeStatus('cancelada')}
        >
          Cancelar transacción
        </Button>
      )}

      {canNoAcceptSwap && onNoAcceptSwap && (
        <Button variant="secondary" disabled={isUpdating} onClick={onNoAcceptSwap}>
          No aceptar
        </Button>
      )}

      {canConfirmDelivery && (
        <Button
          variant="secondary"
          disabled={isUpdating}
          onClick={() => onChangeStatus('completada')}
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
    </div>
  );
}
