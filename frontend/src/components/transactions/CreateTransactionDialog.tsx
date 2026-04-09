'use client';

import { AlertCircle, ClipboardCheck, Info, Mail, UserRound } from 'lucide-react';

import { useCreateTransactionDialogForm } from '@/components/transactions/createDialog/useCreateTransactionDialogForm';
import MeetingLocationFields from '@/components/transactions/MeetingLocationFields';
import SwapProposalSection from '@/components/transactions/swapFlow/SwapProposalSection';
import Button from '@/components/ui/Button';
import type { CreateTransactionDialogProps } from '@/types/transaction';

export default function CreateTransactionDialog({
  isOpen,
  productTitle,
  sellerName,
  sellerEmail,
  transactionType,
  isLoading,
  error,
  onCancel,
  onCreateNewProduct,
  onSubmit,
}: CreateTransactionDialogProps) {
  const {
    buildingCode,
    roomNumber,
    meetingDateTime,
    validationError,
    selectedSwapProductId,
    setBuildingCode,
    setRoomNumber,
    setMeetingDateTime,
    setTimeValidationError,
    setSelectedSwapProductId,
    submit,
  } = useCreateTransactionDialogForm({
    isOpen,
    transactionType,
    onSubmit,
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 p-3 sm:p-4">
      <div className="mx-auto flex h-full w-full max-w-2xl items-end sm:items-center">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="request-item-modal-title"
          className="max-h-[94vh] w-full overflow-hidden rounded-xl border border-border bg-card shadow-lg"
        >
          <div className="max-h-[94vh] overflow-y-auto p-4 sm:p-6">
            <h2
              id="request-item-modal-title"
              className="inline-flex items-center gap-2 text-h3 font-semibold text-card-fg"
            >
              <ClipboardCheck className="h-5 w-5 text-info" />
              Solicitar artículo
            </h2>
            <p className="mt-2 text-sm text-muted-fg">
              Define punto de encuentro en campus para iniciar la solicitud de &quot;{productTitle}
              &quot;.
            </p>

            <div className="mt-4 rounded-lg border border-info/30 bg-info/10 p-3 text-sm text-info">
              <div className="flex items-center gap-2">
                <UserRound className="h-4 w-4" />
                <span className="font-medium">{sellerName}</span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{sellerEmail}</span>
              </div>
            </div>

            {transactionType === 'swap' ? (
              <div className="mt-4">
                <SwapProposalSection
                  selectedProductId={selectedSwapProductId}
                  disabled={isLoading}
                  showCreateButton
                  onSelectProduct={setSelectedSwapProductId}
                  onCreateNewProduct={onCreateNewProduct}
                />
              </div>
            ) : (
              <div className="mt-4">
                <MeetingLocationFields
                  buildingCode={buildingCode}
                  roomNumber={roomNumber}
                  meetingDateTime={meetingDateTime}
                  disabled={isLoading}
                  onBuildingChange={setBuildingCode}
                  onRoomChange={setRoomNumber}
                  onDateTimeChange={setMeetingDateTime}
                  onTimeErrorChange={setTimeValidationError}
                />
              </div>
            )}

            {transactionType === 'swap' && (
              <div className="mt-2 rounded-md border border-warning/30 bg-warning/10 px-3 py-2">
                <p className="inline-flex items-start gap-1.5 text-xs text-warning-fg">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  Agenda en segunda etapa: primero se valida el artículo y después se acuerdan
                  fecha y lugar.
                </p>
              </div>
            )}

            {(validationError || error) && (
              <p className="mt-3 inline-flex items-center gap-2 text-sm text-error">
                <AlertCircle className="h-4 w-4" />
                {validationError || error}
              </p>
            )}

            <p className="mt-4 text-xs text-muted-fg">
              Notificación pendiente: integración con CORE.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <Button variant="danger-outline" onClick={onCancel} disabled={isLoading}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={submit} disabled={isLoading}>
                {isLoading ? 'Enviando...' : 'Enviar solicitud'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
