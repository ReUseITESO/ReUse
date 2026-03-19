// Scaffolding: profile page stub. Add user profile component when core module is ready.
// See reglas_de_escritura_front.md section 3 (Pages) for page conventions.
'use client';

import Link from 'next/link';

import BadgesList from '@/components/gamification/BadgesList';
import PointsBalance from '@/components/gamification/PointsBalance';
import { useAuth } from '@/hooks/useAuth';

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-4xl rounded-lg border border-slate-200 bg-white p-6 text-center">
          <p className="text-slate-700">Cargando perfil...</p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 text-center">
            <p className="font-medium text-yellow-900">Inicia sesion para ver tu perfil</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold text-slate-900">Mi Perfil</h1>

        <section className="mb-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-600">
              {user?.first_name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-slate-900">
                {user?.full_name || `${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim()}
              </h2>
              <p className="mt-1 text-sm text-slate-600">{user?.email}</p>
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-200">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                <span>Usuario activo</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-6 rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Mis Articulos</h2>
              <p className="mt-1 text-sm text-slate-500">Administra los productos que has publicado</p>
            </div>
            <Link
              href="/products/my"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Ver mis articulos
            </Link>
          </div>
        </section>

        <section className="space-y-6">
          <div>
            <h2 className="mb-4 text-lg font-semibold text-slate-800">Gamificacion</h2>
            <PointsBalance />
          </div>
          <div>
            <h2 className="mb-4 text-lg font-semibold text-slate-800">Logros y medallas</h2>
            <BadgesList />
          </div>
        </section>
      </div>
    </main>
  );
}
