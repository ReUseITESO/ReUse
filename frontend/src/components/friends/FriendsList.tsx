'use client';

import { UserMinus } from 'lucide-react';
import type { SocialUser } from '@/types/friends';

interface FriendsListProps {
  friends: SocialUser[];
  onRemove?: (userId: number) => void;
}

export default function FriendsList({ friends, onRemove }: FriendsListProps) {
  if (friends.length === 0) {
    return <p className="py-6 text-center text-sm text-muted-fg">Aun no tienes amigos. Busca usuarios para agregar.</p>;
  }

  return (
    <div className="space-y-2">
      {friends.map(friend => (
        <div key={friend.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {friend.profile_picture ? (
                <img src={friend.profile_picture} alt={friend.first_name} className="h-10 w-10 rounded-full object-cover" />
              ) : friend.first_name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-fg">{friend.full_name}</p>
              <p className="text-xs text-muted-fg">{friend.email}</p>
            </div>
          </div>
          {onRemove && (
            <button onClick={() => onRemove(friend.id)} className="flex items-center gap-1 rounded-lg border border-error/20 px-3 py-1.5 text-xs font-medium text-error transition-colors hover:bg-error/5">
              <UserMinus className="h-3.5 w-3.5" /> Eliminar
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
