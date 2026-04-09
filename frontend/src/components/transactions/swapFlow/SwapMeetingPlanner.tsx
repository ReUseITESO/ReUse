'use client';

import { AlertCircle, CalendarClock, CheckCircle2 } from 'lucide-react';

import SwapMeetingPendingState from '@/components/transactions/swapFlow/SwapMeetingPendingState';
import { useSwapMeetingForm } from '@/components/transactions/swapFlow/useSwapMeetingForm';
import MeetingLocationFields from '@/components/transactions/MeetingLocationFields';
import Button from '@/components/ui/Button';
import type { Transaction } from '@/types/transaction';

interface SwapMeetingPlannerProps {
  transaction: Transaction;
  actorRole: 'buyer' | 'seller';
  isUpdating: boolean;
  onProposeMeeting: (deliveryLocation: string, deliveryDate: Date) => Promise<void>;
  onRespondMeeting: (accepted: boolean) => Promise<void>;
}

export default function SwapMeetingPlanner({
  transaction,
  actorRole,
  isUpdating,
  onProposeMeeting,
  onRespondMeeting,
}: SwapMeetingPlannerProps) {
  const {
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
  } = useSwapMeetingForm();

  async function handleProposeMeeting() {
    const message = validate({ buildingCode, roomNumber, meetingDateTime });
    if (message) {
      setValidationError(message);
      return;
    }

    const payload = buildPayload();
    if (!payload) {
      setValidationError('No se pudo construir la agenda propuesta.');
      return;
    }

    setValidationError(null);
    await onProposeMeeting(payload.deliveryLocation, payload.deliveryDate);
  }

  if (transaction.swap_meeting_status === 'pending_acceptance') {
    const waitingMyResponse = transaction.swap_meeting_proposed_by !== actorRole;
    return (
      <SwapMeetingPendingState
        waitingMyResponse={waitingMyResponse}
        isUpdating={isUpdating}
        onRespondMeeting={onRespondMeeting}
      />
    );
  }

  return (
    <section className="space-y-3 rounded-lg border border-border bg-card p-4">
      <p className="inline-flex items-center gap-2 text-sm font-semibold text-fg">
        <CalendarClock className="h-4 w-4 text-warning" />
        Agenda de intercambio
      </p>

      {transaction.swap_meeting_status === 'accepted' && transaction.delivery_location ? (
        <p className="inline-flex items-center gap-2 rounded-md border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
          <CheckCircle2 className="h-4 w-4" />
          Agenda acordada en {transaction.delivery_location}
        </p>
      ) : (
        <p className="text-sm text-muted-fg">
          Aún no hay agenda acordada. Puedes proponer fecha, hora y lugar para confirmar.
        </p>
      )}

      <MeetingLocationFields
        buildingCode={buildingCode}
        roomNumber={roomNumber}
        meetingDateTime={meetingDateTime}
        disabled={isUpdating}
        onBuildingChange={setBuildingCode}
        onRoomChange={setRoomNumber}
        onDateTimeChange={setMeetingDateTime}
        onTimeErrorChange={setTimeValidationError}
      />

      {validationError && (
        <p className="inline-flex items-center gap-2 text-sm text-error">
          <AlertCircle className="h-4 w-4" />
          {validationError}
        </p>
      )}

      <Button variant="secondary" disabled={isUpdating} onClick={handleProposeMeeting}>
        Proponer agenda
      </Button>
    </section>
  );
}
