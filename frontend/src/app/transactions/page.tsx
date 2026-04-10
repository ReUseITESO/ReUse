import type { Metadata } from 'next';
import { ArrowRightLeft, Clock3 } from 'lucide-react';

import TransactionsPanel from '@/components/transactions/TransactionsPanel';

export const metadata: Metadata = {
  title: 'Transacciones | ReUseITESO',
  description: 'Gestiona tus solicitudes y entregas en ReUseITESO',
};

export default function TransactionsPage() {
  return (
    <main className="space-y-6 px-2 py-8 sm:px-0">
      <header className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <div className="inline-flex items-center gap-2">
          <ArrowRightLeft className="h-5 w-5 text-info" />
          <h1 className="text-h1 font-bold text-fg">Transacciones</h1>
        </div>
        <p className="mt-2 text-sm text-muted-fg">
          Da seguimiento a solicitudes, confirmaciones de entrega y expiraciones de 24 horas.
        </p>
        <p className="mt-2 inline-flex items-center gap-2 text-xs text-muted-fg">
          <Clock3 className="h-3.5 w-3.5" />
          Los cambios de estado se actualizan en tiempo real por filtro seleccionado.
        </p>
      </header>

      <TransactionsPanel />
    </main>
  );
}
