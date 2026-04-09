'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import type { CommunityDetail, CommunityPost, Membership } from '@/types/community';

export function useCommunityDetail(id: string) {
  const [community, setCommunity] = useState<CommunityDetail | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [members, setMembers] = useState<Membership[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [detail, postsData, membersData] = await Promise.all([
        apiClient<CommunityDetail>(`/communities/${id}/`),
        apiClient<{ results: CommunityPost[] }>(`/communities/${id}/posts/`),
        apiClient<{ results: Membership[] }>(`/communities/${id}/members/`),
      ]);
      setCommunity(detail);
      setPosts(postsData.results);
      setMembers(membersData.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar comunidad');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  async function createPost(content: string): Promise<string | null> {
    try {
      await apiClient(`/communities/${id}/posts/`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      });
      await fetchAll();
      return null;
    } catch (err) {
      return err instanceof Error ? err.message : 'Error al publicar';
    }
  }

  async function deletePost(postId: number): Promise<string | null> {
    try {
      await apiClient(`/communities/${id}/posts/${postId}/`, { method: 'DELETE' });
      await fetchAll();
      return null;
    } catch (err) {
      return err instanceof Error ? err.message : 'Error al eliminar';
    }
  }

  async function inviteUser(userId: number): Promise<string | null> {
    try {
      await apiClient(`/communities/${id}/invite/`, {
        method: 'POST',
        body: JSON.stringify({ user_id: userId }),
      });
      return null;
    } catch (err) {
      return err instanceof Error ? err.message : 'Error al invitar';
    }
  }

  async function leaveCommunity(): Promise<string | null> {
    try {
      await apiClient(`/communities/${id}/leave/`, { method: 'POST' });
      return null;
    } catch (err) {
      return err instanceof Error ? err.message : 'Error al salir';
    }
  }

  async function expelMember(userId: number): Promise<string | null> {
    try {
      await apiClient(`/communities/${id}/members/${userId}/`, { method: 'DELETE' });
      await fetchAll();
      return null;
    } catch (err) {
      return err instanceof Error ? err.message : 'Error al expulsar';
    }
  }

  async function deleteCommunity(): Promise<string | null> {
    try {
      await apiClient(`/communities/${id}/`, { method: 'DELETE' });
      return null;
    } catch (err) {
      return err instanceof Error ? err.message : 'Error al eliminar comunidad';
    }
  }

  return {
    community,
    posts,
    members,
    isLoading,
    error,
    refresh: fetchAll,
    createPost,
    deletePost,
    inviteUser,
    leaveCommunity,
    expelMember,
    deleteCommunity,
  };
}
