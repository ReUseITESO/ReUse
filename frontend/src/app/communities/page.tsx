'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Users, Check, Mail, ShoppingBag } from 'lucide-react';

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
    // Daniel's API doesn't have an invitations endpoint
    setInvitations([]);
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
          <div className="h-32 animate-pulse rounded-lg bg-muted" />
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen p-6">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-lg border border-warning/30 bg-warning/10 p-6 text-center">
            <p className="font-medium text-fg">Inicia sesion para ver comunidades</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-fg">Comunidades</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 rounded-lg bg-btn-primary px-4 py-2 text-sm font-medium text-btn-primary-fg transition-colors hover:bg-primary-hover"
          >
            <Plus className="h-4 w-4" />
            Crear comunidad
          </button>
        </div>

        {/* Marketplace Link */}
        <Link
          href="/communities/marketplace"
          className="mb-6 flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 transition-colors hover:bg-blue-100"
        >
          <ShoppingBag className="h-5 w-5 text-blue-600" />
          <div>
            <p className="text-sm font-medium text-blue-900">Marketplace de Comunidades</p>
            <p className="text-xs text-blue-700">Explora artículos exclusivos de tus comunidades</p>
          </div>
        </Link>

        {/* Pending invitations */}
        {invitations.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-fg">
              <Mail className="h-4 w-4 text-info" />
              Invitaciones pendientes ({invitations.length})
            </h2>
            <div className="space-y-2">
              {invitations.map(inv => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between rounded-lg border border-info/30 bg-info/10 p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-fg">{inv.community_name}</p>
                    <p className="text-xs text-muted-fg">Invitado por {inv.invited_by.full_name}</p>
                  </div>
                  <button
                    onClick={() => handleAcceptInvite(inv.community, inv.id)}
                    disabled={loadingInviteId === inv.id}
                    className="flex items-center gap-1 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-accent-fg hover:bg-accent/80 disabled:opacity-50"
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
          <div className="mb-6 rounded-lg border border-border bg-card p-4 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold text-fg">Nueva comunidad</h2>
            {formError && <p className="mb-3 text-sm text-error">{formError}</p>}
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Nombre de la comunidad"
              className="mb-3 w-full rounded-lg border border-input bg-bg px-3 py-2 text-sm text-fg focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Descripcion (opcional)"
              rows={3}
              className="mb-3 w-full rounded-lg border border-input bg-bg px-3 py-2 text-sm text-fg focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-muted-fg hover:bg-muted"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={name.trim().length < 3 || isSubmitting}
                className="rounded-lg bg-btn-primary px-4 py-2 text-sm font-medium text-btn-primary-fg hover:bg-primary-hover disabled:opacity-50"
              >
                {isSubmitting ? 'Creando...' : 'Crear'}
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg border border-error/30 bg-error/10 p-3 text-sm text-error">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : communities.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-muted p-8 text-center">
            <Users className="mx-auto mb-3 h-10 w-10 text-muted-fg" />
            <p className="text-sm text-muted-fg">No perteneces a ninguna comunidad</p>
            <p className="mt-1 text-xs text-muted-fg">Crea una o espera una invitacion</p>
          </div>
        ) : (
          <div className="space-y-3">
            {communities.map(c => (
              <Link
                key={c.id}
                href={`/communities/${c.id}`}
                className="block rounded-lg border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-semibold text-fg">{c.name}</h3>
                    {c.description && (
                      <p className="mt-1 line-clamp-1 text-sm text-muted-fg">{c.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-fg">
                    <Users className="h-4 w-4" />
                    {c.members_count}
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-fg">Creada por {c.creator.full_name}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
