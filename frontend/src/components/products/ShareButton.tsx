'use client';

import { useState } from 'react';
import { Share2, Check, X } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import type { SocialUser, UserConnection } from '@/types/friends';

interface ShareButtonProps {
  productId: number;
  productTitle: string;
}

export default function ShareButton({ productId, productTitle }: ShareButtonProps) {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [friends, setFriends] = useState<SocialUser[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isAuthenticated) return null;

  async function openPicker() {
    setIsOpen(true);
    setIsLoading(true);
    setError(null);
    setSuccess(false);
    setSelectedIds(new Set());
    try {
      const data = await apiClient<{ results: UserConnection[] } | UserConnection[]>(
        '/social/connections/',
      );
      const connections = Array.isArray(data) ? data : (data.results ?? []);
      const accepted = connections
        .filter(c => c.status === 'accepted')
        .map(c => (c.requester.id === user?.id ? c.addressee : c.requester));
      setFriends(accepted);
    } catch {
      setFriends([]);
    } finally {
      setIsLoading(false);
    }
  }

  function toggleFriend(id: number) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleShare() {
    if (selectedIds.size === 0) return;
    setIsSending(true);
    setError(null);
    try {
      await apiClient('/auth/shares/', {
        method: 'POST',
        body: JSON.stringify({ product_id: productId, friend_ids: Array.from(selectedIds) }),
      });
      setSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al compartir');
    } finally {
      setIsSending(false);
    }
  }

  return (
    <>
      <button
        onClick={openPicker}
        className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-fg transition-colors hover:bg-muted"
      >
        <Share2 className="h-4 w-4" /> Compartir
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setIsOpen(false)} />
          <div className="fixed inset-x-4 top-1/2 z-50 mx-auto max-w-md -translate-y-1/2 rounded-2xl border border-border bg-card p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-h3 font-semibold text-fg">Compartir con amigos</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 text-muted-fg hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mb-4 text-sm text-muted-fg">
              Selecciona amigos para compartir "{productTitle}"
            </p>

            {error && (
              <div className="mb-3 rounded-lg border border-error/20 bg-error/5 p-2 text-sm text-error">
                {error}
              </div>
            )}

            {success ? (
              <div className="flex flex-col items-center gap-2 py-6">
                <Check className="h-10 w-10 text-success" />
                <p className="text-sm font-medium text-success">Compartido exitosamente</p>
              </div>
            ) : isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
                ))}
              </div>
            ) : friends.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-fg">
                No tienes amigos para compartir. Agrega amigos primero.
              </p>
            ) : (
              <>
                <div className="max-h-60 space-y-2 overflow-y-auto">
                  {friends.map(friend => {
                    const isSelected = selectedIds.has(friend.id);
                    return (
                      <button
                        key={friend.id}
                        onClick={() => toggleFriend(friend.id)}
                        className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors ${
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:bg-muted'
                        }`}
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {friend.first_name?.[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-fg">{friend.full_name}</p>
                        </div>
                        {isSelected && <Check className="h-4 w-4 text-primary" />}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={handleShare}
                  disabled={selectedIds.size === 0 || isSending}
                  className="mt-4 w-full rounded-lg bg-btn-primary px-4 py-2.5 text-sm font-medium text-btn-primary-fg transition-colors hover:bg-primary-hover disabled:opacity-50"
                >
                  {isSending ? 'Compartiendo...' : `Compartir con ${selectedIds.size} amigo(s)`}
                </button>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}
