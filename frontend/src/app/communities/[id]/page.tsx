'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, Users, LogOut, Crown, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useCommunityDetail } from '@/hooks/useCommunityDetail';

export default function CommunityDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const { community, posts, isLoading, error, createPost, deletePost, joinCommunity, leaveCommunity } = useCommunityDetail(params.id);

  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  const isMember = community?.members?.some(m => m.user.id === user?.id);
  const isAdmin = community?.members?.some(m => m.user.id === user?.id && m.role === 'admin');

  async function handlePost() {
    if (!postContent.trim()) return;
    setIsPosting(true); setPostError(null);
    const err = await createPost(postTitle.trim() || 'Post', postContent.trim());
    if (err) setPostError(err);
    else { setPostTitle(''); setPostContent(''); }
    setIsPosting(false);
  }

  async function handleLeave() {
    const err = await leaveCommunity();
    if (!err) router.push('/communities');
  }

  async function handleJoin() {
    await joinCommunity();
  }

  if (isLoading) return <main className="min-h-screen p-6"><div className="mx-auto max-w-3xl"><div className="h-48 animate-pulse rounded-lg bg-muted" /></div></main>;
  if (error || !community) return <main className="min-h-screen p-6"><div className="mx-auto max-w-3xl"><div className="rounded-lg border border-error/20 bg-error/5 p-6 text-center"><p className="text-sm text-error">{error ?? 'Comunidad no encontrada'}</p></div></div></main>;

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-3xl">
        <Link href="/communities" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-fg hover:text-fg"><ArrowLeft className="h-4 w-4" /> Volver</Link>

        <div className="mb-6 rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-h1 font-bold text-fg">{community.name}</h1>
              {community.description && <p className="mt-2 text-sm text-muted-fg">{community.description}</p>}
              <div className="mt-3 flex items-center gap-4 text-xs text-muted-fg">
                <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {community.members?.length ?? 0} miembros</span>
                <span>Creada por {community.creator.full_name}</span>
              </div>
            </div>
            <div className="flex gap-2">
              {!isMember && (
                <button onClick={handleJoin} className="flex items-center gap-1 rounded-lg bg-btn-primary px-3 py-1.5 text-xs font-medium text-btn-primary-fg hover:bg-primary-hover">
                  <UserPlus className="h-3.5 w-3.5" /> Unirse
                </button>
              )}
              {isMember && !isAdmin && (
                <button onClick={handleLeave} className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-fg hover:bg-muted">
                  <LogOut className="h-3.5 w-3.5" /> Salir
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="mb-4 text-h3 font-semibold text-fg">Publicaciones</h2>

            {isMember && (
              <div className="mb-4 rounded-lg border border-border bg-card p-4 shadow-sm">
                {postError && <p className="mb-2 text-sm text-error">{postError}</p>}
                <input type="text" value={postTitle} onChange={e => setPostTitle(e.target.value)} placeholder="Titulo (opcional)" className="mb-2 w-full rounded-lg border border-input px-3 py-2 text-sm text-fg focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20" />
                <textarea value={postContent} onChange={e => setPostContent(e.target.value)} placeholder="Escribe algo..." rows={3} maxLength={2000} className="w-full rounded-lg border border-input px-3 py-2 text-sm text-fg focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20" />
                <div className="mt-2 flex justify-end">
                  <button onClick={handlePost} disabled={!postContent.trim() || isPosting} className="flex items-center gap-1.5 rounded-lg bg-btn-primary px-4 py-2 text-sm font-medium text-btn-primary-fg hover:bg-primary-hover disabled:opacity-50">
                    <Send className="h-4 w-4" /> {isPosting ? 'Publicando...' : 'Publicar'}
                  </button>
                </div>
              </div>
            )}

            {posts.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-fg">No hay publicaciones todavia</p>
            ) : (
              <div className="space-y-3">
                {posts.map(post => (
                  <div key={post.id} className="rounded-lg border border-border bg-card p-4 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        {post.title && <p className="text-sm font-semibold text-fg">{post.title}</p>}
                        <p className="text-xs text-muted-fg">{post.author_name} · {new Date(post.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}</p>
                      </div>
                      {(post.user === user?.id || isAdmin) && (
                        <button onClick={() => deletePost(post.id)} className="rounded p-1 text-muted-fg hover:bg-error/5 hover:text-error">
                          <span className="text-xs">Eliminar</span>
                        </button>
                      )}
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-fg">{post.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="mb-4 text-h3 font-semibold text-fg">Miembros</h2>
            <div className="space-y-2">
              {community.members?.map(m => (
                <div key={m.id} className="flex items-center gap-2 rounded-lg border border-border bg-card p-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {m.user.first_name?.[0]?.toUpperCase()}
                  </div>
                  <p className="text-sm font-medium text-fg">
                    {m.user.full_name}
                    {m.role === 'admin' && <Crown className="ml-1 inline h-3.5 w-3.5 text-warning" />}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
