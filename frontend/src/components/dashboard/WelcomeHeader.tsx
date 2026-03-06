'use client';

import { Recycle } from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';

export default function WelcomeHeader() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-700 to-blue-500 p-6 text-white sm:p-8">
      <div className="relative z-10">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {isAuthenticated
            ? `Hola, ${user?.first_name ?? 'Usuario'}`
            : 'Bienvenido a ReUseITESO'}
        </h1>
        <p className="mt-1 text-sm text-white/70 sm:text-base">
          {isAuthenticated
            ? 'Esto es lo nuevo en la comunidad ITESO'
            : 'Inicia sesión para ver tu dashboard personalizado'}
        </p>
      </div>
      <Recycle
        className="absolute -bottom-4 -right-4 h-32 w-32 text-white/5 sm:h-40 sm:w-40"
        strokeWidth={1}
      />
    </div>
  );
}
