'use client';

import { useState } from 'react';
import { AlertCircle, CalendarClock, MapPin } from 'lucide-react';

import MeetingLocationFields from '@/components/transactions/MeetingLocationFields';
import Button from '@/components/ui/Button';
import {
  formatMeetingLocation,
  getRoomsForBuilding,
  isCampusBuildingCode,
  isCampusClosedDay,
  isWithinCampusHours,
} from '@/lib/campusLocations';

interface SwapAgendaFormProps {
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (agendaLocation: string, deliveryDate: Date) => Promise<void>;
}

export default function SwapAgendaForm({ isSubmitting, onCancel, onSubmit }: SwapAgendaFormProps) {
  const [buildingCode, setBuildingCode] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [meetingDateTime, setMeetingDateTime] = useState<Date | null>(null);
  const [timeValidationError, setTimeValidationError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

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
    const agendaLocation = formatMeetingLocation({ buildingCode, roomNumber });
    await onSubmit(agendaLocation, meetingDateTime);
  }

  return (
    <div className="mt-4 rounded-lg border border-border bg-muted/30 p-4">
      <p className="inline-flex items-center gap-2 text-sm font-medium text-fg">
        <CalendarClock className="h-4 w-4 text-warning" />
        Proponer fecha y lugar de encuentro
      </p>
      <p className="mt-1 text-xs text-muted-fg">
        <MapPin className="mr-1 inline h-3 w-3" />
        Selecciona un edificio y salón del campus ITESO.
      </p>

      <div className="mt-3">
        <MeetingLocationFields
          buildingCode={buildingCode}
          roomNumber={roomNumber}
          meetingDateTime={meetingDateTime}
          disabled={isSubmitting}
          onBuildingChange={setBuildingCode}
          onRoomChange={setRoomNumber}
          onDateTimeChange={setMeetingDateTime}
          onTimeErrorChange={setTimeValidationError}
        />
      </div>

      {validationError && (
        <p className="mt-2 inline-flex items-center gap-2 text-sm text-error">
          <AlertCircle className="h-4 w-4" />
          {validationError}
        </p>
      )}

      <div className="mt-4 flex items-center justify-end gap-3">
        <Button variant="danger-outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Enviando...' : 'Proponer reunión'}
        </Button>
      </div>
    </div>
  );
}
