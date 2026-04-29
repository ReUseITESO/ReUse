'use client';

import { useNotifications } from '@/hooks/useNotifications';
import NotificationItem from '@/components/notifications/NotificationItem';

export default function NotificationsPage() {
  const { data, loading, error, page, setPage, markRead, markAll } = useNotifications();

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-h1 font-bold text-fg">Notificaciones</h1>
          {data && data.results.some((n) => !n.is_read) && (
            <button
              onClick={markAll}
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              Marcar todas como leidas
            </button>
          )}
        </div>

        {loading && <p className="text-muted-fg">Cargando...</p>}
        {error && <p className="text-error">{error}</p>}

        {data && data.results.length === 0 && (
          <p className="text-muted-fg">No tienes notificaciones.</p>
        )}

        {data && data.results.length > 0 && (
          <div className="space-y-2">
            {data.results.map((n) => (
              <NotificationItem key={n.id} notification={n} onMarkRead={markRead} />
            ))}
          </div>
        )}

        {data && (data.next || data.previous) && (
          <div className="mt-6 flex justify-center gap-4">
            <button
              disabled={!data.previous}
              onClick={() => setPage(page - 1)}
              className="rounded-lg px-4 py-2 text-sm font-medium bg-muted hover:bg-muted/80 disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              disabled={!data.next}
              onClick={() => setPage(page + 1)}
              className="rounded-lg px-4 py-2 text-sm font-medium bg-muted hover:bg-muted/80 disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </main>
  );
}