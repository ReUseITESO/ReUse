'use client';

import { useEffect, useState } from 'react';
import { CalendarClock } from 'lucide-react';

import MeetingLocationFields from '@/components/transactions/MeetingLocationFields';
import Button from '@/components/ui/Button';
import {
  formatMeetingLocation,
  getRoomsForBuilding,
  isCampusBuildingCode,
  isCampusClosedDay,
  isWithinCampusHours,
} from '@/lib/campusLocations';

interface SwapAgendaModalProps {
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
  onCancel: () => void;
  onSubmit: (deliveryLocation: string, deliveryDate: Date) => Promise<void>;
}

export default function SwapAgendaModal({
  isOpen,
  isLoading,
  error,
  onCancel,
  onSubmit,
}: SwapAgendaModalProps) {
  const [buildingCode, setBuildingCode] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [meetingDateTime, setMeetingDateTime] = useState<Date | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [timeValidationError, setTimeValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
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
    if (!getRoomsForBuilding(buildingCode).includes(roomNumber)) {
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
    if (isCampusClosedDay(meetingDateTime) || !isWithinCampusHours(meetingDateTime)) {
      setValidationError('El horario permitido es de lunes a viernes entre 07:00 y 22:00.');
      return;
    }

    setValidationError(null);
    await onSubmit(
      formatMeetingLocation({
        buildingCode,
        roomNumber,
      }),
      meetingDateTime,
    );
  }

  return (
    <div className="fixed inset-0 z-50 !m-0 bg-black/50 p-3 sm:p-4">
      <div className="mx-auto flex h-full w-full max-w-2xl items-end sm:items-center">
        <section className="max-h-[94vh] w-full overflow-hidden rounded-xl border border-border bg-card shadow-lg">
          <div className="max-h-[94vh] overflow-y-auto p-4 sm:p-6">
            <h2 className="inline-flex items-center gap-2 text-h3 font-semibold text-card-fg">
              <CalendarClock className="h-5 w-5 text-info" />
              Proponer fecha y lugar
            </h2>
            <p className="mt-2 text-sm text-muted-fg">
              La otra parte debe aprobar la agenda para continuar el intercambio.
            </p>

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
              <p className="mt-3 text-sm text-error">{validationError || error}</p>
            )}

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                variant="danger-outline"
                onClick={onCancel}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                {isLoading ? 'Enviando...' : 'Enviar agenda'}
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
