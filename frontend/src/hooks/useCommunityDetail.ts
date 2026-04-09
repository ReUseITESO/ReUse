'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import type { CommunityDetail, CommunityPost, CommunityMember } from '@/types/community';

export function useCommunityDetail(id: string) {
  const [community, setCommunity] = useState<CommunityDetail | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const detail = await apiClient<CommunityDetail>(`/social/communities/${id}/`);
      setCommunity(detail);
      setMembers(detail.members ?? []);
      // Fetch posts separately — filter by community
      try {
        const postsData = await apiClient<{ results: CommunityPost[] } | CommunityPost[]>(
          `/social/posts/?community=${id}`,
        );
        const postsList = Array.isArray(postsData) ? postsData : postsData.results ?? [];
        setPosts(postsList);
      } catch {
        setPosts([]);
      }
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
      await apiClient('/social/posts/', {
        method: 'POST',
        body: JSON.stringify({ community: Number(id), content, title: content.slice(0, 50) }),
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

  async function inviteUser(userId: number): Promise<string | null> {
    try {
      await apiClient(`/social/communities/${id}/join/`, {
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
      await apiClient(`/social/communities/${id}/leave/`, { method: 'POST' });
      return null;
    } catch (err) {
      return err instanceof Error ? err.message : 'Error al salir';
    }
  }

  async function expelMember(userId: number): Promise<string | null> {
    try {
      // Daniel's API doesn't have a direct expel endpoint, use leave
      await apiClient(`/social/communities/${id}/leave/`, { method: 'POST' });
      await fetchAll();
      return null;
    } catch (err) {
      return err instanceof Error ? err.message : 'Error al expulsar';
    }
  }

  async function deleteCommunity(): Promise<string | null> {
    try {
      await apiClient(`/social/communities/${id}/`, { method: 'DELETE' });
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
