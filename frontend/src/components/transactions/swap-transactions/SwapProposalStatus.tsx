'use client';

import { CheckCircle2, Clock, MapPin, Package, RefreshCcw, XCircle } from 'lucide-react';

import SwapAgendaForm from '@/components/transactions/swap-transactions/SwapAgendaForm';
import Button from '@/components/ui/Button';
import ErrorMessage from '@/components/ui/ErrorMessage';
import type { SwapStage, SwapTransactionData } from '@/types/transaction';

interface SwapProposalStatusProps {
  swapData: SwapTransactionData;
  actorRole: 'seller' | 'buyer';
  isLoading: boolean;
  error: string | null;
  onRespondProposal: (accept: boolean) => Promise<void>;
  onProposeAgenda: (location: string, date: Date) => Promise<void>;
  onRespondAgenda: (accept: boolean) => Promise<void>;
}

const STAGE_LABELS: Record<SwapStage, string> = {
  proposal_pending: 'Propuesta enviada — esperando respuesta del vendedor',
  proposal_accepted: 'Propuesta aceptada — en espera de agenda',
  proposal_rejected: 'Propuesta rechazada',
  agenda_pending: 'Agenda propuesta — esperando confirmación del vendedor',
  agenda_accepted: 'Agenda confirmada',
  agenda_rejected: 'Agenda rechazada',
};

const STAGE_COLORS: Record<SwapStage, string> = {
  proposal_pending: 'text-warning border-warning/30 bg-warning/10',
  proposal_accepted: 'text-info border-info/30 bg-info/10',
  proposal_rejected: 'text-error border-error/30 bg-error/10',
  agenda_pending: 'text-warning border-warning/30 bg-warning/10',
  agenda_accepted: 'text-accent border-accent/30 bg-accent/10',
  agenda_rejected: 'text-error border-error/30 bg-error/10',
};

export default function SwapProposalStatus({
  swapData,
  actorRole,
  isLoading,
  error,
  onRespondProposal,
  onProposeAgenda,
  onRespondAgenda,
}: SwapProposalStatusProps) {
  const { stage, proposed_product, agenda_location } = swapData;
  const stageColor = STAGE_COLORS[stage];
  const stageLabel = STAGE_LABELS[stage];

  const showProposalActions = stage === 'proposal_pending' && actorRole === 'seller';
  const showAgendaForm = stage === 'proposal_accepted' && actorRole === 'buyer';
  const showAgendaActions = stage === 'agenda_pending' && actorRole === 'seller';

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="inline-flex items-center gap-2 text-sm font-semibold text-fg">
        <RefreshCcw className="h-4 w-4 text-accent" />
        Artículo propuesto para intercambio
      </p>

      <div className={`mt-3 rounded-lg border p-3 text-sm ${stageColor}`}>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 shrink-0" />
          <span className="font-medium">{stageLabel}</span>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
        {proposed_product.image_url ? (
          <img
            src={proposed_product.image_url}
            alt={proposed_product.title}
            className="h-14 w-14 shrink-0 rounded-md object-cover"
          />
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-muted">
            <Package className="h-7 w-7 text-muted-fg" />
          </div>
        )}
        <div className="min-w-0">
          <p className="truncate font-medium text-fg">{proposed_product.title}</p>
          <p className="text-xs text-muted-fg">{proposed_product.category.name}</p>
          <p className="text-xs text-muted-fg">{proposed_product.description}</p>
        </div>
      </div>

      {agenda_location && (
        <p className="mt-3 inline-flex items-center gap-2 text-sm text-muted-fg">
          <MapPin className="h-4 w-4 text-info" />
          Lugar propuesto: <span className="font-medium text-fg">{agenda_location}</span>
        </p>
      )}

      {showProposalActions && (
        <div className="mt-4 flex items-center gap-3">
          <Button
            variant="danger-outline"
            onClick={() => onRespondProposal(false)}
            disabled={isLoading}
          >
            <XCircle className="mr-2 inline h-4 w-4" />
            Rechazar propuesta
          </Button>
          <Button
            variant="primary"
            onClick={() => onRespondProposal(true)}
            disabled={isLoading}
          >
            <CheckCircle2 className="mr-2 inline h-4 w-4" />
            {isLoading ? 'Procesando...' : 'Aceptar propuesta'}
          </Button>
        </div>
      )}

      {showAgendaForm && (
        <SwapAgendaForm
          isSubmitting={isLoading}
          onCancel={() => {}}
          onSubmit={onProposeAgenda}
        />
      )}

      {showAgendaActions && (
        <div className="mt-4 flex items-center gap-3">
          <Button
            variant="danger-outline"
            onClick={() => onRespondAgenda(false)}
            disabled={isLoading}
          >
            <XCircle className="mr-2 inline h-4 w-4" />
            Rechazar agenda
          </Button>
          <Button
            variant="primary"
            onClick={() => onRespondAgenda(true)}
            disabled={isLoading}
          >
            <CheckCircle2 className="mr-2 inline h-4 w-4" />
            {isLoading ? 'Procesando...' : 'Aceptar agenda'}
          </Button>
        </div>
      )}

      {error && <ErrorMessage message={error} />}

      {/* TODO(core-team): Notificar a ambas partes en cada cambio de stage del swap. */}
    </div>
  );
}
