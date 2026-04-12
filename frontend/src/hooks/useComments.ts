'use client';

import { useCallback, useEffect, useState } from 'react';

import { listComments, createComment, deleteComment } from '@/lib/api';

import type { Comment } from '@/types/comment';

interface UseCommentsReturn {
  comments: Comment[];
  count: number;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  loadMoreError: string | null;
  hasMore: boolean;
  loadMore: () => void;
  submitComment: (content: string) => Promise<void>;
  removeComment: (commentId: number) => Promise<void>;
}

export function useComments(productId: number): UseCommentsReturn {
  const [comments, setComments] = useState<Comment[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchComments() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await listComments(productId, 1);
        if (!cancelled) {
          setComments(data.results);
          setCount(data.count);
          setHasMore(data.next !== null);
          setPage(1);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Error al cargar los comentarios');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchComments();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  const loadMore = useCallback(async () => {
    const nextPage = page + 1;
    setLoadMoreError(null);
    try {
      const data = await listComments(productId, nextPage);
      setComments(prev => [...prev, ...data.results]);
      setHasMore(data.next !== null);
      setPage(nextPage);
    } catch (err) {
      setLoadMoreError(err instanceof Error ? err.message : 'Error al cargar más comentarios');
    }
  }, [productId, page]);

  const submitComment = useCallback(
    async (content: string) => {
      setIsSubmitting(true);
      try {
        const newComment = await createComment(productId, content);
        setComments(prev => [...prev, newComment]);
        setCount(prev => prev + 1);
      } finally {
        setIsSubmitting(false);
      }
    },
    [productId],
  );

  const removeComment = useCallback(
    async (commentId: number) => {
      await deleteComment(productId, commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
      setCount(prev => prev - 1);
    },
    [productId],
  );

  return {
    comments,
    count,
    isLoading,
    isSubmitting,
    error,
    loadMoreError,
    hasMore,
    loadMore,
    submitComment,
    removeComment,
  };
}
