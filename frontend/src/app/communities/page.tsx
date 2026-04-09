'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Users, Check, Mail } from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { useCommunities } from '@/hooks/useCommunities';
import { apiClient } from '@/lib/api';

import type { CommunityInvitation } from '@/types/community';

export default function CommunitiesPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { communities, isLoading, error, createCommunity, refresh } = useCommunities();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [invitations, setInvitations] = useState<CommunityInvitation[]>([]);
  const [loadingInviteId, setLoadingInviteId] = useState<number | null>(null);

  const fetchInvitations = useCallback(async () => {
    try {
      const data = await apiClient<{ results: CommunityInvitation[] }>('/social/communities/invitations/');
      setInvitations(data.results);
    } catch {
      setInvitations([]);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchInvitations();
  }, [isAuthenticated, fetchInvitations]);

  async function handleAcceptInvite(communityId: number, inviteId: number) {
    setLoadingInviteId(inviteId);
    try {
      await apiClient(`/social/communities/${communityId}/join/`, { method: 'POST' });
      await Promise.all([fetchInvitations(), refresh()]);
    } catch {
      /* ignore */
    }
    setLoadingInviteId(null);
  }

  async function handleCreate() {
    if (name.trim().length < 3) return;
    setIsSubmitting(true);
    setFormError(null);
    const err = await createCommunity(name.trim(), description.trim());
    if (err) {
      setFormError(err);
    } else {
      setName('');
      setDescription('');
      setShowForm(false);
    }
    setIsSubmitting(false);
  }

  if (authLoading) {
    return (
      <main className="min-h-screen p-6">
        <div className="mx-auto max-w-3xl">
          <div className="h-32 animate-pulse rounded-lg bg-gray-200" />
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen p-6">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 text-center">
            <p className="font-medium text-yellow-900">Inicia sesion para ver comunidades</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Comunidades</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Crear comunidad
          </button>
        </div>

        {/* Pending invitations */}
        {invitations.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Mail className="h-4 w-4 text-blue-600" />
              Invitaciones pendientes ({invitations.length})
            </h2>
            <div className="space-y-2">
              {invitations.map(inv => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{inv.community_name}</p>
                    <p className="text-xs text-gray-500">Invitado por {inv.invited_by.full_name}</p>
                  </div>
                  <button
                    onClick={() => handleAcceptInvite(inv.community, inv.id)}
                    disabled={loadingInviteId === inv.id}
                    className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    <Check className="h-3.5 w-3.5" />
                    {loadingInviteId === inv.id ? 'Uniendo...' : 'Aceptar'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {showForm && (
          <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-gray-900">Nueva comunidad</h2>
            {formError && <p className="mb-3 text-sm text-red-600">{formError}</p>}
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Nombre de la comunidad"
              className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Descripcion (opcional)"
              rows={3}
              className="mb-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={name.trim().length < 3 || isSubmitting}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Creando...' : 'Crear'}
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 animate-pulse rounded-lg bg-gray-200" />
            ))}
          </div>
        ) : communities.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
            <Users className="mx-auto mb-3 h-10 w-10 text-gray-400" />
            <p className="text-sm text-gray-500">No perteneces a ninguna comunidad</p>
            <p className="mt-1 text-xs text-gray-400">Crea una o espera una invitacion</p>
          </div>
        ) : (
          <div className="space-y-3">
            {communities.map(c => (
              <Link
                key={c.id}
                href={`/communities/${c.id}`}
                className="block rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">{c.name}</h3>
                    {c.description && (
                      <p className="mt-1 line-clamp-1 text-sm text-gray-500">{c.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Users className="h-4 w-4" />
                    {c.members_count}
                  </div>
                </div>
                <p className="mt-2 text-xs text-gray-400">Creada por {c.creator.full_name}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
