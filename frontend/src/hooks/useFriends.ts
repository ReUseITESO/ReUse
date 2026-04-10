'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import type { FriendRequest, SocialUser, UserConnection } from '@/types/friends';

export type FriendUser = SocialUser;

export function useFriends() {
  const { user } = useAuth();
  const [connections, setConnections] = useState<UserConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConnections = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient<{ results: UserConnection[] } | UserConnection[]>(
        '/social/connections/',
      );
      const results = Array.isArray(data) ? data : data.results ?? [];
      setConnections(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar conexiones');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  const friends: FriendUser[] = user
    ? connections
        .filter(c => c.status === 'accepted')
        .map(c => (c.requester.id === user.id ? c.addressee : c.requester))
    : [];

  const pendingRequests: FriendRequest[] = user
    ? connections
        .filter(c => c.status === 'pending' && c.addressee.id === user.id)
        .map(c => ({ id: c.id, from_user: c.requester, created_at: c.created_at }))
    : [];

  const pendingSentIds: number[] = user
    ? connections
        .filter(c => c.status === 'pending' && c.requester.id === user.id)
        .map(c => c.addressee.id)
    : [];

  async function sendRequest(addresseeId: number): Promise<string | null> {
    try {
      await apiClient('/social/connections/', {
        method: 'POST',
        body: JSON.stringify({ addressee_id: addresseeId }),
      });
      await fetchConnections();
      return null;
    } catch (err) {
      return err instanceof Error ? err.message : 'Error al enviar solicitud';
    }
  }

  async function acceptRequest(connectionId: number): Promise<string | null> {
    try {
      await apiClient(`/social/connections/${connectionId}/respond/`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'accepted' }),
      });
      await fetchConnections();
      return null;
    } catch (err) {
      return err instanceof Error ? err.message : 'Error al aceptar';
    }
  }

  async function rejectRequest(connectionId: number): Promise<string | null> {
    try {
      await apiClient(`/social/connections/${connectionId}/respond/`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'rejected' }),
      });
      await fetchConnections();
      return null;
    } catch (err) {
      return err instanceof Error ? err.message : 'Error al rechazar';
    }
  }

  async function removeFriend(): Promise<string | null> {
    return 'No se puede eliminar una conexión aceptada desde la API actual.';
  }

  async function searchUsers(query: string): Promise<FriendUser[]> {
    if (query.length < 2) return [];
    try {
      const data = await apiClient<{ results: SocialUser[] } | SocialUser[]>(
        `/auth/users/search/?q=${encodeURIComponent(query)}`,
      );
      if (Array.isArray(data)) return data;
      return data.results ?? [];
    } catch {
      return [];
    }
  }

  return {
    friends,
    pendingRequests,
    pendingSentIds,
    connections,
    isLoading,
    error,
    refresh: fetchConnections,
    sendRequest,
    acceptRequest,
    rejectRequest,
    removeFriend,
    searchUsers,
  };
}