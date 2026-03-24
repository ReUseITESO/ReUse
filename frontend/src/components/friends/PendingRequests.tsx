'use client';

import { useState } from 'react';
import { Check, X } from 'lucide-react';
import type { UserConnection } from '@/types/friends';

interface PendingRequestsProps {
  requests: UserConnection[];
  onRespond: (connectionId: number, status: 'accepted' | 'rejected') => Promise<string | null>;
}

export default function PendingRequests({ requests, onRespond }: PendingRequestsProps) {
  const [loadingId, setLoadingId] = useState<number | null>(null);

  async function handleRespond(id: number, status: 'accepted' | 'rejected') {
    setLoadingId(id);
    await onRespond(id, status);
    setLoadingId(null);
  }

  if (requests.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-fg">No tienes solicitudes pendientes</p>;
  }

  return (
    <div className="space-y-2">
      {requests.map(req => (
        <div key={req.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {req.requester.profile_picture ? (
                <img src={req.requester.profile_picture} alt={req.requester.first_name} className="h-10 w-10 rounded-full object-cover" />
              ) : req.requester.first_name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-fg">{req.requester.full_name}</p>
              <p className="text-xs text-muted-fg">{req.requester.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => handleRespond(req.id, 'accepted')} disabled={loadingId === req.id} className="flex items-center gap-1 rounded-lg bg-success px-3 py-1.5 text-xs font-medium text-success-fg transition-colors hover:bg-success/90 disabled:opacity-50">
              <Check className="h-3.5 w-3.5" /> Aceptar
            </button>
            <button onClick={() => handleRespond(req.id, 'rejected')} disabled={loadingId === req.id} className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-fg transition-colors hover:bg-muted disabled:opacity-50">
              <X className="h-3.5 w-3.5" /> Rechazar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
