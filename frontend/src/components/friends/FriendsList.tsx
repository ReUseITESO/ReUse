'use client';

import { useState } from 'react';
import { UserMinus } from 'lucide-react';

import type { FriendUser } from '@/types/friends';

interface FriendsListProps {
  friends: FriendUser[];
  onRemove: (userId: number) => Promise<string | null>;
}

export default function FriendsList({ friends, onRemove }: FriendsListProps) {
  const [removingId, setRemovingId] = useState<number | null>(null);

  async function handleRemove(userId: number) {
    setRemovingId(userId);
    await onRemove(userId);
    setRemovingId(null);
  }

  if (friends.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-gray-500">
        Aun no tienes amigos. Busca usuarios para agregar.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {friends.map(friend => (
        <div
          key={friend.id}
          className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
              {friend.profile_picture ? (
                <img
                  src={friend.profile_picture}
                  alt={friend.first_name}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                friend.first_name?.[0]?.toUpperCase()
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{friend.full_name}</p>
              <p className="text-xs text-gray-500">{friend.email}</p>
            </div>
          </div>
          <button
            onClick={() => handleRemove(friend.id)}
            disabled={removingId === friend.id}
            className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
          >
            <UserMinus className="h-3.5 w-3.5" />
            Eliminar
          </button>
        </div>
      ))}
    </div>
  );
}
