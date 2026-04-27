'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, ClipboardCheck, Mail, UserRound } from 'lucide-react';

import SwapProductPickerModal from '@/components/transactions/swap-transactions/SwapProductPickerModal';
import MeetingLocationFields from '@/components/transactions/MeetingLocationFields';
import Button from '@/components/ui/Button';
import {
  formatMeetingLocation,
  getRoomsForBuilding,
  isCampusBuildingCode,
  isCampusClosedDay,
  isWithinCampusHours,
} from '@/lib/campusLocations';
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
  onSubmit,
}: CreateTransactionDialogProps) {
  const [buildingCode, setBuildingCode] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [meetingDateTime, setMeetingDateTime] = useState<Date | null>(null);
  const [timeValidationError, setTimeValidationError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setBuildingCode('');
      setRoomNumber('');
      setMeetingDateTime(null);
      setTimeValidationError(null);
      setValidationError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    setRoomNumber('');
  }, [buildingCode]);

  if (!isOpen) return null;

  // For swap items, open the product picker directly (location/date negotiated later)
  if (transactionType === 'swap') {
    return (
      <SwapProductPickerModal
        isOpen={isOpen}
        isSubmitting={isLoading}
        onCancel={onCancel}
        onConfirm={async (productId) => {
          // onSubmit signature: (deliveryLocation, deliveryDate) — for swap we pass placeholders;
          // the real location/date is negotiated in the agenda stage.
          await onSubmit('pendiente', new Date(Date.now() + 24 * 60 * 60 * 1000), productId);
        }}
      />
    );
  }

  async function handleSubmit() {
    if (!buildingCode || !roomNumber || !meetingDateTime) {
      setValidationError('Completa edificio, salón y fecha/hora para continuar.');
      return;
    }

    if (!isCampusBuildingCode(buildingCode)) {
      setValidationError('Selecciona un edificio válido del campus.');
      return;
    }

    const validRooms = getRoomsForBuilding(buildingCode);
    if (!validRooms.includes(roomNumber)) {
      setValidationError('Selecciona un salón válido para el edificio elegido.');
      return;
    }

    if (timeValidationError) {
      setValidationError(timeValidationError);
      return;
    }

    if (meetingDateTime <= new Date()) {
      setValidationError('Selecciona una fecha y hora futura para la reunión.');
      return;
    }

    if (isCampusClosedDay(meetingDateTime)) {
      setValidationError('Solo se permiten reuniones de lunes a viernes.');
      return;
    }

    if (!isWithinCampusHours(meetingDateTime)) {
      setValidationError('El horario permitido es de 07:00 a 22:00.');
      return;
    }

    setValidationError(null);
    const deliveryLocation = formatMeetingLocation({ buildingCode, roomNumber });
    await onSubmit(deliveryLocation, meetingDateTime);
  }

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

            {(validationError || error) && (
              <p className="mt-3 inline-flex items-center gap-2 text-sm text-error">
                <AlertCircle className="h-4 w-4" />
                {validationError || error}
              </p>
            )}

            <p className="mt-4 text-xs text-muted-fg">
              {/* TODO(core-team): Notificar al vendedor cuando se inicie la solicitud. */}
              Notificación pendiente: integración con CORE.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3">
              <Button variant="danger-outline" onClick={onCancel} disabled={isLoading}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? 'Enviando...' : 'Enviar solicitud'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
