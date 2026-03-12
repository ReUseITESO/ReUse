'use client';

import { useCallback, useEffect, useState } from 'react';

import { apiClient } from '@/lib/api';

import type { FriendUser, FriendRequest, FriendsListResponse } from '@/types/friends';

export function useFriends() {
  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFriends = useCallback(async () => {
    try {
      const data = await apiClient<FriendsListResponse>('/auth/friends/');
      setFriends(data.results);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar amigos';
      setError(message);
    }
  }, []);

  const fetchPendingRequests = useCallback(async () => {
    try {
      const data = await apiClient<{ results: FriendRequest[] }>('/auth/friends/requests/');
      setPendingRequests(data.results);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar solicitudes';
      setError(message);
    }
  }, []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    await Promise.all([fetchFriends(), fetchPendingRequests()]);
    setIsLoading(false);
  }, [fetchFriends, fetchPendingRequests]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function sendRequest(toUserId: number): Promise<string | null> {
    try {
      await apiClient('/auth/friends/request/', {
        method: 'POST',
        body: JSON.stringify({ to_user_id: toUserId }),
      });
      return null;
    } catch (err) {
      return err instanceof Error ? err.message : 'Error al enviar solicitud';
    }
  }

  async function acceptRequest(requestId: number): Promise<string | null> {
    try {
      await apiClient(`/auth/friends/requests/${requestId}/accept/`, { method: 'POST' });
      await refresh();
      return null;
    } catch (err) {
      return err instanceof Error ? err.message : 'Error al aceptar';
    }
  }

  async function rejectRequest(requestId: number): Promise<string | null> {
    try {
      await apiClient(`/auth/friends/requests/${requestId}/reject/`, { method: 'POST' });
      await refresh();
      return null;
    } catch (err) {
      return err instanceof Error ? err.message : 'Error al rechazar';
    }
  }

  async function removeFriend(userId: number): Promise<string | null> {
    try {
      await apiClient(`/auth/friends/${userId}/`, { method: 'DELETE' });
      await refresh();
      return null;
    } catch (err) {
      return err instanceof Error ? err.message : 'Error al eliminar amigo';
    }
  }

  async function searchUsers(query: string): Promise<FriendUser[]> {
    if (query.length < 2) return [];
    try {
      const data = await apiClient<FriendUser[]>(`/auth/users/search/?q=${encodeURIComponent(query)}`);
      return data;
    } catch {
      return [];
    }
  }

  return {
    friends,
    pendingRequests,
    isLoading,
    error,
    refresh,
    sendRequest,
    acceptRequest,
    rejectRequest,
    removeFriend,
    searchUsers,
  };
}
