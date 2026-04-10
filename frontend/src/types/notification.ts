export type NotificationType =
  | 'badge_earned'
  | 'points_added'
  | 'transaction_confirmed'
  | 'product_reported'
  | 'new_reaction'
  | 'shared_item';

export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  body: string | null;
  reference_id: number | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface NotificationCount {
  unread_count: number;
}

export interface PaginatedNotifications {
  count: number;
  next: string | null;
  previous: string | null;
  results: Notification[];
}