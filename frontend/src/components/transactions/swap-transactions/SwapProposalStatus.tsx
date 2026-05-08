'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, Clock, RefreshCcw, XCircle, CalendarClock } from 'lucide-react';

import SwapAgendaForm from '@/components/transactions/swap-transactions/SwapAgendaForm';
import SwapProductPickerModal from '@/components/transactions/swap-transactions/SwapProductPickerModal';
import Button from '@/components/ui/Button';
import ErrorMessage from '@/components/ui/ErrorMessage';
import type { SwapStage, SwapTransactionData } from '@/types/transaction';

interface SwapProposalStatusProps {
  swapData: SwapTransactionData;
  actorRole: 'seller' | 'buyer';
  deliveryDate: string | null;
  isLoading: boolean;
  error: string | null;
  onRespondProposal: (accept: boolean) => Promise<void>;
  onProposeProduct: (productId: number) => Promise<void>;
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
  deliveryDate,
  isLoading,
  error,
  onRespondProposal,
  onProposeProduct,
  onProposeAgenda,
  onRespondAgenda,
}: SwapProposalStatusProps) {
  const [isAgendaModalOpen, setIsAgendaModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  useEffect(() => {
    if (isAgendaModalOpen || isProductModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isAgendaModalOpen, isProductModalOpen]);

  const { stage, agenda_location } = swapData;
  const stageColor = STAGE_COLORS[stage];
  const stageLabel = STAGE_LABELS[stage];

  const showProposalActions = stage === 'proposal_pending' && actorRole === 'seller';
  const showAgendaForm = stage === 'proposal_accepted' && actorRole === 'buyer';
  const showAgendaActions = stage === 'agenda_pending' && actorRole === 'seller';
  const isReProposalStage =
    (stage === 'proposal_rejected' || stage === 'agenda_rejected') && actorRole === 'buyer';

  if (stage === 'agenda_accepted') {
    return null;
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <h3 className="mb-4 text-lg font-bold text-fg tracking-tight">Gestión del Intercambio</h3>

      {!isReProposalStage && (
        <div className={`rounded-lg border p-3 text-sm ${stageColor}`}>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 shrink-0" />
            <span className="font-medium">{stageLabel}</span>
          </div>
          {stage === 'agenda_pending' && agenda_location && (
            <div className="mt-2 space-y-1 ml-6">
              <p className="text-muted-fg font-medium">
                Lugar propuesto: <span className="text-fg">{agenda_location}</span>
              </p>
              {deliveryDate && (
                <p className="text-muted-fg font-medium">
                  Fecha propuesta:{' '}
                  <span className="text-fg">
                    {new Date(deliveryDate).toLocaleString('es-MX', {
                      dateStyle: 'long',
                      timeStyle: 'short',
                      hour12: false,
                    })}
                  </span>
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {showProposalActions && (
        <div className="mt-5 flex items-center gap-3">
          <Button
            variant="danger-outline"
            onClick={() => onRespondProposal(false)}
            disabled={isLoading}
            className="flex-1"
          >
            <XCircle className="mr-2 inline h-4 w-4" />
            Rechazar
          </Button>
          <Button
            variant="primary"
            onClick={() => onRespondProposal(true)}
            disabled={isLoading}
            className="flex-1"
          >
            <CheckCircle2 className="mr-2 inline h-4 w-4" />
            {isLoading ? 'Procesando...' : 'Aceptar artículo'}
          </Button>
        </div>
      )}

      {(showAgendaForm || stage === 'agenda_rejected') && actorRole === 'buyer' && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          {!isAgendaModalOpen ? (
            <>
              <Button
                variant="primary"
                onClick={() => setIsAgendaModalOpen(true)}
                className="w-full sm:w-auto"
              >
                <CalendarClock className="mr-2 inline h-4 w-4" />
                {stage === 'agenda_rejected' ? 'Proponer otra fecha' : 'Agendar lugar y fecha'}
              </Button>

              {stage === 'agenda_rejected' && (
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-bold uppercase tracking-wider ${stageColor}`}
                >
                  <XCircle className="h-3 w-3" />
                  {stageLabel}
                </div>
              )}
            </>
          ) : (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-all overflow-y-auto">
              <div className="w-full max-w-2xl rounded-xl bg-card shadow-2xl border border-border my-auto">
                <SwapAgendaForm
                  isSubmitting={isLoading}
                  onCancel={() => setIsAgendaModalOpen(false)}
                  onSubmit={async (loc, date) => {
                    await onProposeAgenda(loc, date);
                    setIsAgendaModalOpen(false);
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {stage === 'proposal_rejected' && actorRole === 'buyer' && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Button
              variant="primary"
              onClick={() => setIsProductModalOpen(true)}
              className="w-full sm:w-auto"
            >
              <RefreshCcw className="mr-2 inline h-4 w-4" />
              Proponer otro artículo
            </Button>
          </div>

          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-bold uppercase tracking-wider ${stageColor}`}
          >
            <XCircle className="h-3 w-3" />
            {stageLabel}
          </div>

          {isProductModalOpen && (
            <SwapProductPickerModal
              isOpen={isProductModalOpen}
              isSubmitting={isLoading}
              onCancel={() => setIsProductModalOpen(false)}
              onConfirm={async productId => {
                await onProposeProduct(productId);
                setIsProductModalOpen(false);
              }}
            />
          )}
        </div>
      )}

      {showAgendaActions && (
        <div className="mt-5 flex items-center gap-3">
          <Button
            variant="danger-outline"
            onClick={() => onRespondAgenda(false)}
            disabled={isLoading}
            className="flex-1"
          >
            <XCircle className="mr-2 inline h-4 w-4" />
            Rechazar agenda
          </Button>
          <Button
            variant="primary"
            onClick={() => onRespondAgenda(true)}
            disabled={isLoading}
            className="flex-1"
          >
            <CheckCircle2 className="mr-2 inline h-4 w-4" />
            {isLoading ? 'Procesando...' : 'Aceptar agenda'}
          </Button>
        </div>
      )}

      {error && <ErrorMessage message={error} />}
    </div>
  );
}
