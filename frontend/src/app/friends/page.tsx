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
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const {
    friends,
    pendingRequests,
    pendingSentIds,
    isLoading,
    error,
    sendRequest,
    acceptRequest,
    rejectRequest,
    removeFriend,
    searchUsers,
  } = useFriends();

  const [activeTab, setActiveTab] = useState<Tab>('friends');

  if (authLoading) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-3xl">
          <div className="h-32 animate-pulse rounded-lg bg-slate-200" />
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 text-center">
            <p className="font-medium text-yellow-900">Inicia sesion para ver tus amigos</p>
          </div>
        </div>
      </main>
    );
  }

  const tabs = [
    { id: 'friends' as Tab, label: 'Mis amigos', icon: Users, count: friends.length },
    { id: 'requests' as Tab, label: 'Solicitudes', icon: Clock, count: pendingRequests.length },
    { id: 'search' as Tab, label: 'Buscar usuarios', icon: UserPlus, count: null },
  ];

  const friendIds = friends.map(f => f.id);

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-3xl font-bold text-slate-900">Amigos</h1>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-lg border border-gray-200 bg-white p-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {tab.count !== null && tab.count > 0 && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      isActive ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-slate-200" />
            ))}
          </div>
        ) : (
          <>
            {activeTab === 'friends' && <FriendsList friends={friends} onRemove={removeFriend} />}
            {activeTab === 'requests' && (
              <PendingRequests
                requests={pendingRequests}
                onAccept={acceptRequest}
                onReject={rejectRequest}
              />
            )}
            {activeTab === 'search' && (
              <UserSearch
                onSearch={searchUsers}
                onSendRequest={sendRequest}
                friendIds={friendIds}
                pendingSentIds={pendingSentIds}
              />
            )}
          </>
        )}
      </div>
    </main>
  );
}
