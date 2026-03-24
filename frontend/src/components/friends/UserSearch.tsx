'use client';

import { useState } from 'react';
import { Search, UserPlus, Check } from 'lucide-react';
import type { SocialUser } from '@/types/friends';

interface UserSearchProps {
  onSearch: (query: string) => Promise<SocialUser[]>;
  onSendRequest: (userId: number) => Promise<string | null>;
  friendIds: number[];
}

export default function UserSearch({ onSearch, onSendRequest, friendIds }: UserSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SocialUser[]>([]);
  const [sentIds, setSentIds] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);

  async function handleSearch() {
    if (query.length < 2) return;
    setError(null);
    const users = await onSearch(query);
    setResults(users);
  }

  async function handleSend(userId: number) {
    setError(null);
    const err = await onSendRequest(userId);
    if (err) setError(err);
    else setSentIds(prev => new Set(prev).add(userId));
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-fg" />
          <input type="text" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} placeholder="Buscar por nombre o email..." className="w-full rounded-lg border border-input py-2 pl-10 pr-3 text-sm text-fg transition-colors focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20" />
        </div>
        <button onClick={handleSearch} disabled={query.length < 2} className="rounded-lg bg-btn-primary px-4 py-2 text-sm font-medium text-btn-primary-fg transition-colors hover:bg-primary-hover disabled:opacity-50">Buscar</button>
      </div>
      {error && <p className="text-sm text-error">{error}</p>}
      {results.length > 0 && (
        <div className="space-y-2">
          {results.map(user => {
            const isFriend = friendIds.includes(user.id);
            const isSent = sentIds.has(user.id);
            return (
              <div key={user.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {user.profile_picture ? <img src={user.profile_picture} alt={user.first_name} className="h-10 w-10 rounded-full object-cover" /> : user.first_name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-fg">{user.full_name}</p>
                    <p className="text-xs text-muted-fg">{user.email}</p>
                  </div>
                </div>
                {isFriend ? (
                  <span className="flex items-center gap-1 text-xs text-success"><Check className="h-4 w-4" /> Amigos</span>
                ) : isSent ? (
                  <span className="text-xs text-muted-fg">Solicitud enviada</span>
                ) : (
                  <button onClick={() => handleSend(user.id)} className="flex items-center gap-1 rounded-lg border border-primary px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/5">
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
