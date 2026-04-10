import { useState, useEffect, useCallback } from 'react';
import {
  getNotifications,
  getNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
} from '@/lib/api';
import type { Notification, PaginatedNotifications } from '@/types/notification';

const POLL_INTERVAL = 30_000;

export function useNotificationCount() {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetch = useCallback(async () => {
    try {
      const data = await getNotificationCount();
      setUnreadCount(data.unread_count);
    } catch {
      // silencioso
    }
  }, []);

  useEffect(() => {
    fetch();
    const interval = setInterval(fetch, POLL_INTERVAL);
    const onFocus = () => fetch();
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [fetch]);

  return { unreadCount, refresh: fetch };
}

export function useNotifications() {
  const [data, setData] = useState<PaginatedNotifications | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const fetch = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const result = await getNotifications(p);
      setData(result);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al cargar notificaciones');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch(page);
  }, [fetch, page]);

  const markRead = useCallback(async (id: number) => {
    await markNotificationRead(id);
    setData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        results: prev.results.map(n => (n.id === id ? { ...n, is_read: true } : n)),
      };
    });
  }, []);

  const markAll = useCallback(async () => {
    await markAllNotificationsRead();
    setData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        results: prev.results.map(n => ({ ...n, is_read: true })),
      };
    });
  }, []);

  return { data, loading, error, page, setPage, markRead, markAll, refresh: () => fetch(page) };
}