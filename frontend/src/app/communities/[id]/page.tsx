'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Send,
  Users,
  LogOut,
  Trash2,
  UserMinus,
  Crown,
  UserPlus,
  Search,
} from 'lucide-react';
import Link from 'next/link';

import { useAuth } from '@/hooks/useAuth';
import { useCommunityDetail } from '@/hooks/useCommunityDetail';
import { apiClient } from '@/lib/api';

import type { SocialUser } from '@/types/community';

export default function CommunityDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const {
    community,
    posts,
    members,
    isLoading,
    error,
    createPost,
    deletePost,
    inviteUser,
    leaveCommunity,
    joinCommunity,
    expelMember,
    deleteCommunity,
  } = useCommunityDetail(params.id);

  const [postContent, setPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  const [showInvite, setShowInvite] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SocialUser[]>([]);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [invitedIds, setInvitedIds] = useState<Set<number>>(new Set());

  // Derive admin/member status from members list
  const currentMembership = members.find(m => m.user.id === user?.id);
  const isAdmin = currentMembership?.role === 'admin';
  const isMember = !!currentMembership;
  const memberIds = members.map(m => m.user.id);

  async function handlePost() {
    if (!postContent.trim()) return;
    setIsPosting(true);
    setPostError(null);
    const err = await createPost(postContent.trim());
    if (err) setPostError(err);
    else setPostContent('');
    setIsPosting(false);
  }

  async function handleJoin() {
    await joinCommunity();
  }

  async function handleLeave() {
    const err = await leaveCommunity();
    if (!err) router.push('/communities');
  }

  async function handleDelete() {
    const err = await deleteCommunity();
    if (!err) router.push('/communities');
  }

  async function handleSearch() {
    if (searchQuery.length < 2) return;
    try {
      const data = await apiClient<{ results: SocialUser[] } | SocialUser[]>(
        `/auth/users/search/?q=${encodeURIComponent(searchQuery)}`,
      );
      const results = Array.isArray(data) ? data : (data.results ?? []);
      setSearchResults(results);
    } catch {
      setSearchResults([]);
    }
  }

  async function handleInvite(userId: number) {
    setInviteError(null);
    const err = await inviteUser(userId);
    if (err) {
      setInviteError(err);
    } else {
      setInvitedIds(prev => new Set(prev).add(userId));
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen p-6">
        <div className="mx-auto max-w-3xl">
          <div className="h-48 animate-pulse rounded-lg bg-gray-200" />
        </div>
      </main>
    );
  }

  if (error || !community) {
    return (
      <main className="min-h-screen p-6">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-sm text-red-700">{error ?? 'Comunidad no encontrada'}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/communities"
          className="mb-4 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" /> Volver a comunidades
        </Link>

        {/* Header */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{community.name}</h1>
              {community.description && (
                <p className="mt-2 text-sm text-gray-600">{community.description}</p>
              )}
              <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" /> {community.members_count} miembros
                </span>
                <span>Creada por {community.creator.full_name}</span>
              </div>
            </div>
            <div className="flex gap-2">
              {!isMember && (
                <button
                  onClick={handleJoin}
                  className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                >
                  <UserPlus className="h-3.5 w-3.5" /> Unirse
                </button>
              )}
              {isMember && !isAdmin && (
                <button
                  onClick={handleLeave}
                  className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100"
                >
                  <LogOut className="h-3.5 w-3.5" /> Salir
                </button>
              )}
              {isAdmin && (
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Eliminar
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Posts */}
          <div className="lg:col-span-2">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Publicaciones</h2>

            {isMember && (
              <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                {postError && <p className="mb-2 text-sm text-red-600">{postError}</p>}
                <textarea
                  value={postContent}
                  onChange={e => setPostContent(e.target.value)}
                  placeholder="Escribe algo para la comunidad..."
                  rows={3}
                  maxLength={2000}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={handlePost}
                    disabled={!postContent.trim() || isPosting}
                    className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                    {isPosting ? 'Publicando...' : 'Publicar'}
                  </button>
                </div>
              </div>
            )}

            {posts.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500">No hay publicaciones todavia</p>
            ) : (
              <div className="space-y-3">
                {posts.map(post => (
                  <div
                    key={post.id}
                    className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                          {post.author_name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {post.author_name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(post.created_at).toLocaleDateString('es-MX', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                      {(post.user === user?.id || isAdmin) && (
                        <button
                          onClick={() => deletePost(post.id)}
                          className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm text-gray-700">{post.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Members sidebar */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Miembros</h2>
            </div>


            <div className="space-y-2">
              {members.map(m => (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                      {m.user.first_name?.[0]?.toUpperCase()}
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {m.user.full_name}
                      {m.role === 'admin' && (
                        <Crown className="ml-1 inline h-3.5 w-3.5 text-amber-500" />
                      )}
                    </p>
                  </div>
                  {isAdmin && m.user.id !== user?.id && (
                    <button
                      onClick={() => expelMember(m.user.id)}
                      className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                      title="Expulsar"
                    >
                      <UserMinus className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}