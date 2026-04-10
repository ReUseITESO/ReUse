'use client';

import type { SocialUser } from '@/types/friends';

interface FriendsListProps {
  friends: SocialUser[];
  onRemove?: (userId: number) => Promise<string | null>;
}

export default function FriendsList({ friends }: FriendsListProps) {
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
        </div>
      ))}
    </div>
  );
}
