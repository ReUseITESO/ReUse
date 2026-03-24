'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import type { UserConnection, SocialUser } from '@/types/friends';

export function useFriends() {
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

  useEffect(() => { fetchConnections(); }, [fetchConnections]);

  function getFriends(userId: number): SocialUser[] {
    return connections
      .filter(c => c.status === 'accepted')
      .map(c => c.requester.id === userId ? c.addressee : c.requester);
  }

  function getPendingRequests(userId: number): UserConnection[] {
    return connections.filter(
      c => c.status === 'pending' && c.addressee.id === userId,
    );
  }

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

  async function respondToRequest(connectionId: number, newStatus: 'accepted' | 'rejected'): Promise<string | null> {
    try {
      await apiClient(`/social/connections/${connectionId}/respond/`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      await fetchConnections();
      return null;
    } catch (err) {
      return err instanceof Error ? err.message : 'Error al responder';
    }
  }

  async function searchUsers(query: string): Promise<SocialUser[]> {
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
    connections,
    isLoading,
    error,
    refresh: fetchConnections,
    getFriends,
    getPendingRequests,
    sendRequest,
    respondToRequest,
    searchUsers,
  };
}
