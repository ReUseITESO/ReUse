// Scaffolding: profile page stub. Add user profile component when core module is ready.
// See reglas_de_escritura_front.md section 3 (Pages) for page conventions.
'use client';
import { useAuth } from '@/hooks/useAuth';
import BadgesList from '@/components/gamification/BadgesList';
import PointsBalance from '@/components/gamification/PointsBalance';

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
          <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-6 text-center">
            <p className="text-yellow-900 font-medium">
              Inicia sesion para ver tu perfil y progreso de nivel
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
        <section className="mb-6 rounded-lg bg-white border border-slate-200 p-6 shadow-sm">
          <div className="flex items-start gap-6">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 text-blue-600 text-2xl font-bold">
              {user?.first_name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-slate-900">{user?.full_name}</h2>
              <p className="text-sm text-slate-600 mt-1">{user?.email}</p>
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-200">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                <span>Usuario activo</span>
              </div>
            </div>
          </div>
        </section>

        {/* Gamification Section */}
        <section className="space-y-6">
          <div>
            <h2 className="mb-4 text-lg font-semibold text-slate-800">Gamificación</h2>
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
