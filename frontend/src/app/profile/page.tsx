'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Pencil } from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import ProfileEditForm from '@/components/profile/ProfileEditForm';
import PointsBalance from '@/components/gamification/PointsBalance';
import BadgesList from '@/components/gamification/BadgesList';

import type { User } from '@/types/auth';

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [localUser, setLocalUser] = useState<User | null>(null);

  const displayUser = localUser ?? user;

  function handleSave(updated: User) {
    setLocalUser(updated);
    setIsEditing(false);
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-4xl">
          <div className="h-32 animate-pulse rounded-lg border border-slate-200 bg-slate-100" />
        </div>
      </main>
    );
  }

  if (!isAuthenticated || !displayUser) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6 text-center">
            <p className="font-medium text-yellow-900">
              Inicia sesion para ver tu perfil
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold text-slate-900">Mi Perfil</h1>

        {/* User Info Card */}
        <section className="mb-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          {isEditing ? (
            <ProfileEditForm
              user={displayUser}
              onSave={handleSave}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <div className="flex items-start gap-6">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-600">
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
                    <h2 className="text-xl font-semibold text-slate-900">
                      {displayUser.full_name || `${displayUser.first_name} ${displayUser.last_name}`.trim()}
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">{displayUser.email}</p>
                    {displayUser.phone && (
                      <p className="mt-0.5 text-sm text-slate-500">{displayUser.phone}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    <Pencil className="h-4 w-4" />
                    Editar perfil
                  </button>
                </div>
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  Usuario activo
                </div>
                {displayUser.interests && displayUser.interests.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {displayUser.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* My Articles Section */}
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

        {/* Gamification Section */}
        <section className="space-y-6">
          <div>
            <h2 className="mb-4 text-lg font-semibold text-slate-800">Gamificacion</h2>
            <PointsBalance />
          </div>
        </section>

        {/* Badges Section */}
        <section>
          <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 border-b pb-2 text-xl font-semibold text-slate-800">Logros y Medallas</h2>
            <BadgesList />
          </div>
        </section>
      </div>
    </main>
  );
}
