import { useState } from 'react';

import {
  formatMeetingLocation,
  getRoomsForBuilding,
  isCampusBuildingCode,
  isCampusClosedDay,
  isWithinCampusHours,
} from '@/lib/campusLocations';

interface SwapMeetingFormValues {
  buildingCode: string;
  roomNumber: string;
  meetingDateTime: Date | null;
}

export function useSwapMeetingForm() {
  const [buildingCode, setBuildingCode] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [meetingDateTime, setMeetingDateTime] = useState<Date | null>(null);
  const [timeValidationError, setTimeValidationError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  function validate(values: SwapMeetingFormValues): string | null {
    if (!values.buildingCode || !values.roomNumber || !values.meetingDateTime) {
      return 'Completa edificio, salón y fecha/hora para proponer agenda.';
    }

    if (!isCampusBuildingCode(values.buildingCode)) {
      return 'Selecciona un edificio válido del campus.';
    }

    const validRooms = getRoomsForBuilding(values.buildingCode);
    if (!validRooms.includes(values.roomNumber)) {
      return 'Selecciona un salón válido para el edificio elegido.';
    }

    if (timeValidationError) {
      return timeValidationError;
    }

    if (values.meetingDateTime <= new Date()) {
      return 'Selecciona una fecha y hora futura para la agenda.';
    }

    if (isCampusClosedDay(values.meetingDateTime)) {
      return 'Solo se permiten reuniones de lunes a viernes.';
    }

    if (!isWithinCampusHours(values.meetingDateTime)) {
      return 'El horario permitido es de 07:00 a 22:00.';
    }

    return null;
  }

  function buildPayload() {
    if (!buildingCode || !roomNumber || !meetingDateTime) {
      return null;
    }

    return {
      deliveryLocation: formatMeetingLocation({ buildingCode, roomNumber }),
      deliveryDate: meetingDateTime,
    };
  }

  return {
    buildingCode,
    roomNumber,
    meetingDateTime,
    validationError,
    setBuildingCode,
    setRoomNumber,
    setMeetingDateTime,
    setTimeValidationError,
    setValidationError,
    validate,
    buildPayload,
  };
}
