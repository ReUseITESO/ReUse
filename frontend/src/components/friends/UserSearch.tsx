'use client';

import { useState } from 'react';
import { Search, UserPlus, Check } from 'lucide-react';

import type { FriendUser } from '@/types/friends';

interface UserSearchProps {
  onSearch: (query: string) => Promise<FriendUser[]>;
  onSendRequest: (userId: number) => Promise<string | null>;
  friendIds: number[];
}

export default function UserSearch({ onSearch, onSendRequest, friendIds }: UserSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FriendUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [sentIds, setSentIds] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);

  async function handleSearch() {
    if (query.length < 2) return;
    setIsSearching(true);
    setError(null);
    const users = await onSearch(query);
    setResults(users);
    setIsSearching(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  }

  async function handleSend(userId: number) {
    setError(null);
    const err = await onSendRequest(userId);
    if (err) {
      setError(err);
    } else {
      setSentIds(prev => new Set(prev).add(userId));
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar por nombre o email..."
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={query.length < 2 || isSearching}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          Buscar
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map(user => {
            const isFriend = friendIds.includes(user.id);
            const isSent = sentIds.has(user.id);
            return (
              <div
                key={user.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                    {user.profile_picture ? (
                      <img src={user.profile_picture} alt={user.first_name} className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      user.first_name?.[0]?.toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                {isFriend ? (
                  <span className="flex items-center gap-1 text-xs text-green-600">
                    <Check className="h-4 w-4" /> Amigos
                  </span>
                ) : isSent ? (
                  <span className="text-xs text-gray-500">Solicitud enviada</span>
                ) : (
                  <button
                    onClick={() => handleSend(user.id)}
                    className="flex items-center gap-1 rounded-lg border border-blue-600 px-3 py-1.5 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50"
                  >
                    <UserPlus className="h-3.5 w-3.5" /> Agregar
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
