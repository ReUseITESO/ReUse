'use client';

import { useState } from 'react';
import { Users, UserPlus, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useFriends } from '@/hooks/useFriends';
import UserSearch from '@/components/friends/UserSearch';
import PendingRequests from '@/components/friends/PendingRequests';
import FriendsList from '@/components/friends/FriendsList';

type Tab = 'friends' | 'requests' | 'search';

export default function FriendsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { connections, isLoading, error, sendRequest, respondToRequest, searchUsers } = useFriends();
  const [activeTab, setActiveTab] = useState<Tab>('friends');

  const userId = user?.id ?? 0;
  const friends = connections.filter(c => c.status === 'accepted').map(c => c.requester.id === userId ? c.addressee : c.requester);
  const pendingRequests = connections.filter(c => c.status === 'pending' && c.addressee.id === userId);
  const friendIds = friends.map(f => f.id);

  if (authLoading) {
    return <main className="min-h-screen p-6"><div className="mx-auto max-w-3xl"><div className="h-32 animate-pulse rounded-lg bg-muted" /></div></main>;
  }

  if (!isAuthenticated) {
    return <main className="min-h-screen p-6"><div className="mx-auto max-w-3xl"><div className="rounded-lg border border-warning/20 bg-warning/5 p-6 text-center"><p className="font-medium text-fg">Inicia sesion para ver tus amigos</p></div></div></main>;
  }

  const tabs = [
    { id: 'friends' as Tab, label: 'Mis amigos', icon: Users, count: friends.length },
    { id: 'requests' as Tab, label: 'Solicitudes', icon: Clock, count: pendingRequests.length },
    { id: 'search' as Tab, label: 'Buscar usuarios', icon: UserPlus, count: null },
  ];

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-h1 font-bold text-fg">Amigos</h1>
        <div className="mb-6 flex gap-1 rounded-lg border border-border bg-card p-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-fg hover:bg-muted'}`}>
                <Icon className="h-4 w-4" /> {tab.label}
                {tab.count !== null && tab.count > 0 && (
                  <span className={`rounded-full px-2 py-0.5 text-xs ${isActive ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-fg'}`}>{tab.count}</span>
                )}
              </button>
            );
          })}
        </div>
        {error && <div className="mb-4 rounded-lg border border-error/20 bg-error/5 p-3 text-sm text-error">{error}</div>}
        {isLoading ? (
          <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />)}</div>
        ) : (
          <>
            {activeTab === 'friends' && <FriendsList friends={friends} />}
            {activeTab === 'requests' && <PendingRequests requests={pendingRequests} onRespond={respondToRequest} />}
            {activeTab === 'search' && <UserSearch onSearch={searchUsers} onSendRequest={sendRequest} friendIds={friendIds} />}
          </>
        )}
      </div>
    </main>
  );
}
