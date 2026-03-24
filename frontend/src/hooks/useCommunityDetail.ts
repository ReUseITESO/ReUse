'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import type { CommunityDetail, CommunityPost } from '@/types/community';

export function useCommunityDetail(id: string) {
  const [community, setCommunity] = useState<CommunityDetail | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [detail, postsData] = await Promise.all([
        apiClient<CommunityDetail>(`/social/communities/${id}/`),
        apiClient<{ results: CommunityPost[] } | CommunityPost[]>(`/social/posts/?community=${id}`),
      ]);
      setCommunity(detail);
      const postResults = Array.isArray(postsData) ? postsData : postsData.results ?? [];
      setPosts(postResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar comunidad');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  async function createPost(title: string, content: string): Promise<string | null> {
    try {
      await apiClient('/social/posts/', {
        method: 'POST',
        body: JSON.stringify({ community: Number(id), title, content }),
      });
      await fetchAll();
      return null;
    } catch (err) {
      return err instanceof Error ? err.message : 'Error al publicar';
    }
  }

  async function deletePost(postId: number): Promise<string | null> {
    try {
      await apiClient(`/social/posts/${postId}/`, { method: 'DELETE' });
      await fetchAll();
      return null;
    } catch (err) {
      return err instanceof Error ? err.message : 'Error al eliminar';
    }
  }

  async function joinCommunity(): Promise<string | null> {
    try {
      await apiClient(`/social/communities/${id}/join/`, { method: 'POST' });
      await fetchAll();
      return null;
    } catch (err) {
      return err instanceof Error ? err.message : 'Error al unirse';
    }
  }

  async function leaveCommunity(): Promise<string | null> {
    try {
      await apiClient(`/social/communities/${id}/leave/`, { method: 'POST' });
      return null;
    } catch (err) {
      return err instanceof Error ? err.message : 'Error al salir';
    }
  }

  return {
    community, posts, isLoading, error,
    refresh: fetchAll, createPost, deletePost, joinCommunity, leaveCommunity,
  };
}
