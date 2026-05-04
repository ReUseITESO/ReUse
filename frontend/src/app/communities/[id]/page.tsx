'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, Users, LogOut, Trash2, UserPlus, Crown } from 'lucide-react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from 'next/link';

import { useAuth } from '@/hooks/useAuth';
import { useCommunityDetail } from '@/hooks/useCommunityDetail';
import { useCommunityMarketplace } from '@/hooks/useCommunityMarketplace';
import CommunityMarketplaceSection from '@/components/communities/CommunityMarketplaceSection';
import LeaderBoard from '@/components/communities/LeaderBoard';

// Helper for accessibility attributes
function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

// Panel props interface
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// The Panel wrapper
function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

export default function CommunityDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const { id } = params;
  const {
    community,
    posts,
    members,
    isLoading,
    error,
    createPost,
    deletePost,
    leaveCommunity,
    joinCommunity,
    deleteCommunity,
  } = useCommunityDetail(id);

  const {
    products,
    isLoading: productsLoading,
    error: productsError,
    refresh: refreshProducts,
  } = useCommunityMarketplace(id);

  const [postContent, setPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const currentMembership = members.find(m => m.user.id === user?.id);
  const isAdmin = currentMembership?.role === 'admin';
  const isMember = !!currentMembership;

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

  if (isLoading) {
    return (
      <main className="min-h-screen p-6">
        <div className="mx-auto max-w-3xl">
          <div className="h-48 animate-pulse rounded-lg bg-muted" />
        </div>
      </main>
    );
  }

  if (error || !community) {
    return (
      <main className="min-h-screen p-6">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
            <p className="text-sm text-destructive">{error ?? 'Comunidad no encontrada'}</p>
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
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Volver a comunidades
        </Link>

        {/* Header */}
        <div className="mb-6 rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{community.name}</h1>
              {community.description && (
                <p className="mt-2 text-sm text-muted-foreground">{community.description}</p>
              )}
              <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
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
                  className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                >
                  <UserPlus className="h-3.5 w-3.5" /> Unirse
                </button>
              )}
              {isMember && !isAdmin && (
                <button
                  onClick={handleLeave}
                  className="flex items-center gap-1 rounded-lg border border-input px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
                >
                  <LogOut className="h-3.5 w-3.5" /> Salir
                </button>
              )}
              {isAdmin && (
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-1 rounded-lg border border-destructive/50 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10"
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
            <h2 className="mb-4 text-lg font-semibold text-foreground">Publicaciones</h2>

            {isMember && (
              <div className="mb-4 rounded-lg border border-border bg-card p-4 shadow-sm">
                {postError && <p className="mb-2 text-sm text-destructive">{postError}</p>}
                <textarea
                  value={postContent}
                  onChange={e => setPostContent(e.target.value)}
                  placeholder="Escribe algo para la comunidad..."
                  rows={3}
                  maxLength={2000}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={handlePost}
                    disabled={!postContent.trim() || isPosting}
                    className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                    {isPosting ? 'Publicando...' : 'Publicar'}
                  </button>
                </div>
              </div>
            )}

            {posts.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No hay publicaciones todavia
              </p>
            ) : (
              <div className="space-y-3">
                {posts.map(post => (
                  <div
                    key={post.id}
                    className="rounded-lg border border-border bg-card p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {post.author_name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{post.author_name}</p>
                          <p className="text-xs text-muted-foreground">
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
                          className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm text-foreground">
                      {post.content}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Marketplace Section */}
            <div className="mt-8">
              <CommunityMarketplaceSection
                products={products}
                isLoading={productsLoading}
                error={productsError}
                communityName={community?.name || ''}
                isAdmin={isAdmin}
                communityId={Number(id)}
                onProductRemoved={refreshProducts}
              />
            </div>
          </div>

          {/* Leaderboard and members sidebar */}
          <div>

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={value} 
                onChange={handleChange} 
                aria-label="basic tabs example"
                sx={{
                  // Style for ALL tabs (unselected state)
                  '& .MuiTab-root': {
                    color: 'primary.main', // Automatically flips: Black in light, White in dark
                    opacity: 0.6,          // Optional: makes unselected slightly muted
                  },
                  // Style for the ACTIVE tab
                  '& .Mui-selected': {
                    color: 'primary.main', // Your theme's primary color 
                    opacity: 1,
                  },
                }}
              >
                <Tab label="Miembros" {...a11yProps(0)} />
                <Tab label="Leadeboard" {...a11yProps(1)} />
              </Tabs>
            </Box>

            {/* Members tab section */}
            
            <CustomTabPanel value={value} index={0}>
              <div>
                {/* <h2 className="mb-4 text-lg font-semibold text-foreground">Miembros</h2> */}
                <div className="space-y-2">
                  {members.map(m => (
                    <div
                      key={m.id}
                      className="flex items-center gap-2 rounded-lg border border-border bg-card p-3"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {m.user.first_name?.[0]?.toUpperCase()}
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        {m.user.full_name}
                        {m.role === 'admin' && (
                          <Crown className="ml-1 inline h-3.5 w-3.5 text-amber-500" />
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CustomTabPanel>

            {/* Leaderboard tab section */}
            
            <CustomTabPanel value={value} index={1}>
              <LeaderBoard members={members} posts={posts}/>
            </CustomTabPanel>
          
          </div>

        
        </div>
      </div>
    </main>
  );
}
