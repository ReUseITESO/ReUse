// Scaffolding: profile page stub. Add user profile component when core module is ready.
// See reglas_de_escritura_front.md section 3 (Pages) for page conventions.
'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import PointsBalance from '@/components/gamification/PointsBalance';
import BadgesList from '@/components/gamification/BadgesList';

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-4xl">
          <div className="h-32 animate-pulse rounded-lg border border-border bg-muted" />
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-lg bg-warning/5 border border-warning/20 p-6 text-center">
            <p className="text-fg font-medium">
              Inicia sesión para ver tu perfil
            </p>
          </div>
        </div>
      </main>
    );
  }

 return (
        <main className="min-h-screen bg-background p-6">
            <div className="mx-auto max-w-4xl">
                <h1 className="mb-8 text-h1 font-bold text-fg">Mi Perfil</h1>

        {/* User Info Card */}
        <section className="mb-6 rounded-lg bg-card border border-border p-6 shadow-sm">
          <div className="flex items-start gap-6">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary text-2xl font-bold">
              {user?.first_name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="text-h3 font-semibold text-fg">{user?.full_name || `${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim()}</h2>
              <p className="text-sm text-muted-fg mt-1">{user?.email}</p>
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success ring-1 ring-inset ring-success/20">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                Usuario activo
              </div>
            </div>
          </div>
        </section>

        {/* My Articles Section */}
        <section className="mb-6 rounded-lg bg-card border p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-h3 font-semibold text-fg">Mis Artículos</h2>
              <p className="mt-1 text-sm text-muted-fg">Administra los productos que has publicado</p>
            </div>
            <Link
              href="/products/my"
              className="
                inline-flex items-center gap-2 rounded-lg
              bg-btn-primary px-4 py-2 text-sm font-medium
              text-btn-primary-fg transition-colors hover:bg-primary-hover"
            >
              Ver mis artículos
            </Link>
          </div>
        </section>

        {/* Gamification Section */}
        <section className="space-y-6">
          <div>
            <h2 className="mb-4 text-h3 font-semibold text-fg">Gamificación</h2>
            <PointsBalance />
          </div>
        </section>

        {/* TODO: Add more profile sections */}
        {/* - Published items */}
        {/* - Transaction history */}
        {/* - Badges earned */}
        {/* - Account settings */}
                  <section>
                    {/* Logros y Medallas (Su trabajo) */}
                    <div className="bg-card p-6 rounded-lg border border-border shadow-sm mt-6">
                        <h2 className="mb-4 text-h3 font-semibold border-b pb-2 text-fg">Logros y Medallas</h2>
                        <BadgesList />
                    </div>
                </section>

                {/* TODO: Add more profile sections */}
                {/* - Published items */}
                {/* - Transaction history */}
                {/* - Account settings */}
            </div>
        </main>
    );
}
