import { Clock3 } from 'lucide-react';

import Button from '@/components/ui/Button';

import type { Transaction, TransactionRole } from '@/types/transaction';

interface SwapStagePanelProps {
  transaction: Transaction;
  actorRole: TransactionRole;
  isUpdating: boolean;
  onRepropose: () => void;
  onOpenAgenda: () => void;
  onDecideProposal: (accepted: boolean) => void;
  onDecideAgenda: (accepted: boolean) => void;
}

const STAGE_LABELS: Record<string, string> = {
  proposal_pending: 'Propuesta de artículo pendiente de revisión',
  proposal_rejected: 'Artículo rechazado, necesitas proponer otro',
  proposal_accepted: 'Artículo aceptado, falta proponer agenda',
  agenda_pending: 'Agenda propuesta, esperando decisión de la otra persona',
  agenda_rejected: 'Agenda rechazada, propone otra fecha y lugar',
  agenda_accepted: 'Agenda aceptada, ya puedes confirmar entrega',
};

export default function SwapStagePanel({
  transaction,
  actorRole,
  isUpdating,
  onRepropose,
  onOpenAgenda,
  onDecideProposal,
  onDecideAgenda,
}: SwapStagePanelProps) {
  const stage = transaction.swap_stage ?? 'proposal_pending';

  const canSellerDecideProposal = actorRole === 'seller' && stage === 'proposal_pending';
  const canBuyerRepropose = actorRole === 'buyer' && stage === 'proposal_rejected';
  const canBuyerProposeAgenda =
    actorRole === 'buyer' && (stage === 'proposal_accepted' || stage === 'agenda_rejected');
  const canSellerDecideAgenda = actorRole === 'seller' && stage === 'agenda_pending';

  return (
    <section className="space-y-3 rounded-lg border border-info/30 bg-card p-4">
      <h2 className="inline-flex items-center gap-2 text-sm font-semibold text-fg">
        <Clock3 className="h-4 w-4 text-info" />
        Etapa de intercambio
      </h2>
      <p className="text-sm text-muted-fg">
        {STAGE_LABELS[stage] ?? 'Etapa de intercambio no definida'}
      </p>

      <div className="flex flex-wrap gap-2">
        {canSellerDecideProposal && (
          <>
            <Button variant="primary" disabled={isUpdating} onClick={() => onDecideProposal(true)}>
              Confirmar solicitud de intercambio
            </Button>
            <Button
              variant="danger-outline"
              disabled={isUpdating}
              onClick={() => onDecideProposal(false)}
            >
              Rechazar artículo
            </Button>
          </>
        )}

        {canBuyerRepropose && (
          <Button variant="secondary" disabled={isUpdating} onClick={onRepropose}>
            Proponer otro artículo
          </Button>
        )}

        {canBuyerProposeAgenda && (
          <Button variant="secondary" disabled={isUpdating} onClick={onOpenAgenda}>
            Proponer fecha y lugar
          </Button>
        )}

        {canSellerDecideAgenda && (
          <>
            <Button variant="primary" disabled={isUpdating} onClick={() => onDecideAgenda(true)}>
              Aceptar agenda
            </Button>
            <Button
              variant="danger-outline"
              disabled={isUpdating}
              onClick={() => onDecideAgenda(false)}
            >
              Rechazar agenda
            </Button>
          </>
        )}
      </div>
    </section>
  );
}
