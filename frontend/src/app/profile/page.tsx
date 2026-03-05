'use client';

import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <main className="p-8">
        <h1 className="mb-6 text-2xl font-bold">Mi perfil</h1>
        {user && (
          <div className="mx-auto max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Nombre</p>
                <p className="font-medium text-gray-900">{user.first_name} {user.last_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Correo</p>
                <p className="font-medium text-gray-900">{user.email}</p>
              </div>
              {user.phone && (
                <div>
                  <p className="text-sm text-gray-500">Teléfono</p>
                  <p className="font-medium text-gray-900">{user.phone}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Puntos</p>
                <p className="font-medium text-gray-900">{user.points}</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
