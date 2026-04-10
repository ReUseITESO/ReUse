'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Pencil } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import ProfileEditForm from '@/components/profile/ProfileEditForm';
import PointsBalance from '@/components/gamification/PointsBalance';
import BadgesList from '@/components/gamification/BadgesList';
import { deactivateAccount } from '@/lib/auth';
import type { User } from '@/types/auth';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [localUser, setLocalUser] = useState<User | null>(null);
  const displayUser = localUser ?? user;

  // HU-CORE-17: estado del modal de desactivación
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [deactivateError, setDeactivateError] = useState('');

  async function handleDeactivateConfirm() {
    setIsDeactivating(true);
    setDeactivateError('');
    try {
      await deactivateAccount();
      await signOut();
      router.replace('/auth/signin');
    } catch (err) {
      setDeactivateError(
        err instanceof Error ? err.message : 'Error al desactivar la cuenta.',
      );
      setIsDeactivating(false);
    }
  }

  function handleSave(updated: User) {
    setLocalUser(updated);
    setIsEditing(false);
  }

  if (isLoading) {
    return (
      <main className="min-h-screen p-6">
        <div className="mx-auto max-w-4xl">
          <div className="h-32 animate-pulse rounded-lg border border-border bg-muted" />
        </div>
      </main>
    );
  }

  if (!isAuthenticated || !displayUser) {
    return (
      <main className="min-h-screen p-6">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-lg border border-warning/20 bg-warning/5 p-6 text-center">
            <p className="font-medium text-fg">Inicia sesion para ver tu perfil</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-h1 font-bold text-fg">Mi Perfil</h1>

        <section className="mb-6 rounded-lg border border-border bg-card p-6 shadow-sm">
          {isEditing ? (
            <ProfileEditForm
              user={displayUser}
              onSave={handleSave}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <div className="flex items-start gap-6">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                {displayUser.profile_picture ? (
                  <img
                    src={displayUser.profile_picture}
                    alt={displayUser.first_name}
                    className="h-20 w-20 rounded-full object-cover"
                  />
                ) : (
                  displayUser.first_name?.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-h3 font-semibold text-fg">
                      {displayUser.full_name ||
                        `${displayUser.first_name} ${displayUser.last_name}`.trim()}
                    </h2>
                    <p className="mt-1 text-sm text-muted-fg">{displayUser.email}</p>
                    {displayUser.phone && (
                      <p className="mt-0.5 text-sm text-muted-fg">{displayUser.phone}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-fg transition-colors hover:bg-muted"
                  >
                    <Pencil className="h-4 w-4" /> Editar perfil
                  </button>
                </div>
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success ring-1 ring-inset ring-success/20">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" /> Usuario activo
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="mb-6 rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-h3 font-semibold text-fg">Mis Articulos</h2>
              <p className="mt-1 text-sm text-muted-fg">
                Administra los productos que has publicado
              </p>
            </div>
            <Link
              href="/products/my"
              className="inline-flex items-center gap-2 rounded-lg bg-btn-primary px-4 py-2 text-sm font-medium text-btn-primary-fg transition-colors hover:bg-primary-hover"
            >
              Ver mis articulos
            </Link>
          </div>
        </section>

        <section className="space-y-6">
          <div>
            <h2 className="mb-4 text-h3 font-semibold text-fg">Gamificacion</h2>
            <PointsBalance />
          </div>
        </section>

        <section>
          <div className="mt-6 rounded-lg border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-4 border-b pb-2 text-h3 font-semibold text-fg">Logros y Medallas</h2>
            <BadgesList />
          </div>
        </section>

        {/* HU-CORE-17: Sección de desactivación de cuenta */}
        <section className="mt-8">
          <div className="rounded-lg border border-error/20 bg-error/5 p-6">
            <h2 className="text-h3 font-semibold text-fg mb-1">Zona de peligro</h2>
            <p className="text-sm text-muted-fg mb-4">
              Al desactivar tu cuenta dejarás de aparecer en la plataforma. Podrás reactivarla en
              cualquier momento solicitando un correo de reactivación.
            </p>
            <button
              onClick={() => { setDeactivateError(''); setShowDeactivateModal(true); }}
              className="rounded-lg border border-error/40 px-4 py-2 text-sm font-medium
                         text-error transition-colors hover:bg-error/10"
            >
              Desactivar mi cuenta
            </button>
          </div>
        </section>
      </div>

      {/* HU-CORE-17: Modal de confirmación de desactivación */}
      {showDeactivateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-card p-6 shadow-xl">
            <h3 className="text-h3 font-bold text-fg mb-2">¿Desactivar tu cuenta?</h3>
            <p className="text-sm text-muted-fg mb-4">
              Tu cuenta quedará desactivada y cerraremos tu sesión. Para reactivarla, podrás
              solicitar un correo con enlace de reactivación cuando quieras.
            </p>

            {deactivateError && (
              <p className="mb-3 rounded-lg border border-error/20 bg-error/5 px-3 py-2 text-sm text-error">
                {deactivateError}
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleDeactivateConfirm}
                disabled={isDeactivating}
                className="flex-1 rounded-lg bg-error px-4 py-2.5 text-sm font-medium
                           text-white transition-colors hover:bg-error/80 disabled:opacity-50"
              >
                {isDeactivating ? 'Desactivando…' : 'Sí, desactivar'}
              </button>
              <button
                onClick={() => setShowDeactivateModal(false)}
                disabled={isDeactivating}
                className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm
                           font-medium text-fg transition-colors hover:bg-muted disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
