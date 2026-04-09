import { Clock3 } from 'lucide-react';

import Button from '@/components/ui/Button';

interface SwapMeetingPendingStateProps {
  waitingMyResponse: boolean;
  isUpdating: boolean;
  onRespondMeeting: (accepted: boolean) => Promise<void>;
}

export default function SwapMeetingPendingState({
  waitingMyResponse,
  isUpdating,
  onRespondMeeting,
}: SwapMeetingPendingStateProps) {
  return (
    <section className="space-y-3 rounded-lg border border-info/30 bg-info/10 p-4">
      <p className="inline-flex items-center gap-2 text-sm font-semibold text-info">
        <Clock3 className="h-4 w-4" />
        Agenda pendiente de confirmación
      </p>
      <p className="text-sm text-info">
        {waitingMyResponse
          ? 'La contraparte propuso fecha y lugar. Confirma o rechaza esta agenda.'
          : 'Tu propuesta de agenda está en espera de respuesta de la contraparte.'}
      </p>

      {waitingMyResponse && (
        <div className="flex flex-wrap gap-2">
          <Button variant="success" disabled={isUpdating} onClick={() => onRespondMeeting(true)}>
            Aceptar agenda
          </Button>
          <Button
            variant="danger-outline"
            disabled={isUpdating}
            onClick={() => onRespondMeeting(false)}
          >
            No aceptar agenda
          </Button>
        </div>
      )}
    </section>
  );
}
