import { useEffect, useState } from 'react';

import {
  formatMeetingLocation,
  getRoomsForBuilding,
  isCampusBuildingCode,
  isCampusClosedDay,
  isWithinCampusHours,
} from '@/lib/campusLocations';
import type { TransactionType } from '@/types/product';

import type { CreateTransactionDialogSubmitPayload } from '@/types/transaction';

interface UseCreateTransactionDialogFormProps {
  isOpen: boolean;
  transactionType: TransactionType;
  onSubmit: (payload: CreateTransactionDialogSubmitPayload) => Promise<void>;
}

export function useCreateTransactionDialogForm({
  isOpen,
  transactionType,
  onSubmit,
}: UseCreateTransactionDialogFormProps) {
  const [buildingCode, setBuildingCode] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [meetingDateTime, setMeetingDateTime] = useState<Date | null>(null);
  const [timeValidationError, setTimeValidationError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [selectedSwapProductId, setSelectedSwapProductId] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setBuildingCode('');
      setRoomNumber('');
      setMeetingDateTime(null);
      setTimeValidationError(null);
      setValidationError(null);
      setSelectedSwapProductId(null);
    }
  }, [isOpen]);

  useEffect(() => {
    setRoomNumber('');
  }, [buildingCode]);

  async function submit() {
    if (transactionType === 'swap') {
      if (!selectedSwapProductId) {
        setValidationError('Selecciona uno de tus productos para proponer el intercambio.');
        return;
      }

      setValidationError(null);
      await onSubmit({ swapProductId: selectedSwapProductId });
      return;
    }

    if (!buildingCode || !roomNumber || !meetingDateTime) {
      setValidationError('Completa edificio, salon y fecha/hora para continuar.');
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

    if (isCampusClosedDay(meetingDateTime)) {
      setValidationError('Solo se permiten reuniones de lunes a viernes.');
      return;
    }

    if (!isWithinCampusHours(meetingDateTime)) {
      setValidationError('El horario permitido es de 07:00 a 22:00.');
      return;
    }

    setValidationError(null);
    await onSubmit({
      deliveryLocation: formatMeetingLocation({ buildingCode, roomNumber }),
      deliveryDate: meetingDateTime,
    });
  }

  return {
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
  };
}
