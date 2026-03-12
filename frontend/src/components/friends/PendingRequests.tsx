'use client';

import { useState } from 'react';
import { Check, X } from 'lucide-react';

import type { FriendRequest } from '@/types/friends';

interface PendingRequestsProps {
  requests: FriendRequest[];
  onAccept: (requestId: number) => Promise<string | null>;
  onReject: (requestId: number) => Promise<string | null>;
}

export default function PendingRequests({ requests, onAccept, onReject }: PendingRequestsProps) {
  const [loadingId, setLoadingId] = useState<number | null>(null);

  async function handleAccept(id: number) {
    setLoadingId(id);
    await onAccept(id);
    setLoadingId(null);
  }

  async function handleReject(id: number) {
    setLoadingId(id);
    await onReject(id);
    setLoadingId(null);
  }

  if (requests.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-gray-500">
        No tienes solicitudes pendientes
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {requests.map(req => (
        <div
          key={req.id}
          className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
              {req.from_user.profile_picture ? (
                <img src={req.from_user.profile_picture} alt={req.from_user.first_name} className="h-10 w-10 rounded-full object-cover" />
              ) : (
                req.from_user.first_name?.[0]?.toUpperCase()
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{req.from_user.full_name}</p>
              <p className="text-xs text-gray-500">{req.from_user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAccept(req.id)}
              disabled={loadingId === req.id}
              className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
            >
              <Check className="h-3.5 w-3.5" /> Aceptar
            </button>
            <button
              onClick={() => handleReject(req.id)}
              disabled={loadingId === req.id}
              className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-50"
            >
              <X className="h-3.5 w-3.5" /> Rechazar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
