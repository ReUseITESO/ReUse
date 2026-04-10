'use client';

import { useNotifications, useNotificationCount } from '@/hooks/useNotifications';
import NotificationItem from '@/components/notifications/NotificationItem';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import { Bell } from 'lucide-react';

export default function NotificationsPage() {
  const { data, loading, error, page, setPage, markRead, markAll } = useNotifications();
  const { refresh: refreshCount } = useNotificationCount();

  async function handleMarkRead(id: number) {
    await markRead(id);
    refreshCount();
  }

  async function handleMarkAll() {
    await markAll();
    refreshCount();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-h2 font-bold text-fg">Notificaciones</h1>
        {data && data.results.some(n => !n.is_read) && (
          <button
            onClick={handleMarkAll}
            className="text-sm font-medium text-primary hover:underline"
          >
            Marcar todas como leídas
          </button>
        )}
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      )}

      {error && (
        <p className="text-center text-sm text-error">{error}</p>
      )}

      {!loading && !error && data && (
        <>
          {data.results.length === 0 ? (
            <EmptyState message="No tienes notificaciones por el momento." />
          ) : (
            <div className="flex flex-col gap-1">
              {data.results.map(n => (
                <NotificationItem key={n.id} notification={n} onMarkRead={handleMarkRead} />
              ))}
            </div>
          )}

          {(data.previous || data.next) && (
            <div className="mt-6 flex justify-center gap-3">
              <button
                disabled={!data.previous}
                onClick={() => setPage(p => p - 1)}
                className="rounded-lg border border-border px-4 py-2 text-sm disabled:opacity-40"
              >
                Anterior
              </button>
              <span className="flex items-center text-sm text-muted-fg">Página {page}</span>
              <button
                disabled={!data.next}
                onClick={() => setPage(p => p + 1)}
                className="rounded-lg border border-border px-4 py-2 text-sm disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}