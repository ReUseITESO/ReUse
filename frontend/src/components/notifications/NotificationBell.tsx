'use client';

import { Bell } from 'lucide-react';
import Link from 'next/link';
import { useNotificationCount } from '@/hooks/useNotifications';

export default function NotificationBell() {
  const { unreadCount } = useNotificationCount();

  return (
    <Link
      href="/notifications"
      className="relative rounded-lg p-2 text-muted-fg transition-colors hover:bg-muted"
      aria-label="Notificaciones"
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-error text-[10px] font-bold text-white">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  );
}
