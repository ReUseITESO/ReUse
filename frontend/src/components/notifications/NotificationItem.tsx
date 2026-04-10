'use client';

import { Bell, Gift, Star, ArrowLeftRight, Users, Heart, Share2 } from 'lucide-react';
import type { Notification, NotificationType } from '@/types/notification';

const ICON_MAP: Record<NotificationType, React.ReactNode> = {
  badge_earned: <Gift className="h-5 w-5 text-warning" />,
  points_added: <Star className="h-5 w-5 text-warning" />,
  transaction_confirmed: <ArrowLeftRight className="h-5 w-5 text-success" />,
  product_reported: <Bell className="h-5 w-5 text-error" />,
  new_reaction: <Heart className="h-5 w-5 text-error" />,
  shared_item: <Share2 className="h-5 w-5 text-info" />,
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Ahora';
  if (mins < 60) return `Hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  return `Hace ${days}d`;
}

interface Props {
  notification: Notification;
  onMarkRead: (id: number) => void;
}

export default function NotificationItem({ notification, onMarkRead }: Props) {
  const { id, type, title, body, is_read, created_at } = notification;

  return (
    <button
      onClick={() => !is_read && onMarkRead(id)}
      className={`flex w-full items-start gap-3 rounded-xl px-4 py-3 text-left transition-colors hover:bg-muted ${!is_read ? 'bg-primary/5' : ''}`}
    >
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
        {ICON_MAP[type] ?? <Bell className="h-5 w-5 text-muted-fg" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${!is_read ? 'font-semibold text-fg' : 'font-medium text-fg'}`}>
          {title}
        </p>
        {body && <p className="mt-0.5 text-xs text-muted-fg line-clamp-2">{body}</p>}
        <p className="mt-1 text-xs text-muted-fg">{timeAgo(created_at)}</p>
      </div>
      {!is_read && (
        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
      )}
    </button>
  );
}