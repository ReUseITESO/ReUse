'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCommunities } from '@/hooks/useCommunities';

export default function CommunitiesPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { communities, isLoading, error, createCommunity } = useCommunities();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreate() {
    if (name.trim().length < 3) return;
    setIsSubmitting(true); setFormError(null);
    const err = await createCommunity(name.trim(), description.trim());
    if (err) setFormError(err);
    else { setName(''); setDescription(''); setShowForm(false); }
    setIsSubmitting(false);
  }

  if (authLoading) return <main className="min-h-screen p-6"><div className="mx-auto max-w-3xl"><div className="h-32 animate-pulse rounded-lg bg-muted" /></div></main>;
  if (!isAuthenticated) return <main className="min-h-screen p-6"><div className="mx-auto max-w-3xl"><div className="rounded-lg border border-warning/20 bg-warning/5 p-6 text-center"><p className="font-medium text-fg">Inicia sesion para ver comunidades</p></div></div></main>;

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-h1 font-bold text-fg">Comunidades</h1>
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1.5 rounded-lg bg-btn-primary px-4 py-2 text-sm font-medium text-btn-primary-fg transition-colors hover:bg-primary-hover">
            <Plus className="h-4 w-4" /> Crear comunidad
          </button>
        </div>

        {showForm && (
          <div className="mb-6 rounded-lg border border-border bg-card p-4 shadow-sm">
            <h2 className="mb-3 text-h3 font-semibold text-fg">Nueva comunidad</h2>
            {formError && <p className="mb-3 text-sm text-error">{formError}</p>}
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Nombre de la comunidad" className="mb-3 w-full rounded-lg border border-input px-3 py-2 text-sm text-fg focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20" />
            <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Descripcion (opcional)" rows={3} className="mb-3 w-full rounded-lg border border-input px-3 py-2 text-sm text-fg focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowForm(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-fg hover:bg-muted">Cancelar</button>
              <button onClick={handleCreate} disabled={name.trim().length < 3 || isSubmitting} className="rounded-lg bg-btn-primary px-4 py-2 text-sm font-medium text-btn-primary-fg hover:bg-primary-hover disabled:opacity-50">{isSubmitting ? 'Creando...' : 'Crear'}</button>
            </div>
          </div>
        )}

        {error && <div className="mb-4 rounded-lg border border-error/20 bg-error/5 p-3 text-sm text-error">{error}</div>}

        {isLoading ? (
          <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />)}</div>
        ) : communities.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-muted/50 p-8 text-center">
            <Users className="mx-auto mb-3 h-10 w-10 text-muted-fg" />
            <p className="text-sm text-muted-fg">No hay comunidades disponibles</p>
            <p className="mt-1 text-xs text-muted-fg">Crea la primera comunidad</p>
          </div>
        ) : (
          <div className="space-y-3">
            {communities.map(c => (
              <Link key={c.id} href={`/communities/${c.id}`} className="block rounded-lg border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-body font-semibold text-fg">{c.name}</h3>
                    {c.description && <p className="mt-1 line-clamp-1 text-sm text-muted-fg">{c.description}</p>}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-fg"><Users className="h-4 w-4" /> {c.members_count}</div>
                </div>
                <p className="mt-2 text-xs text-muted-fg">Creada por {c.creator.full_name}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
