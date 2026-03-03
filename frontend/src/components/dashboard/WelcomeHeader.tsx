'use client';

import { Recycle } from 'lucide-react';

import { useMockAuth } from '@/context/MockAuthContext';

export default function WelcomeHeader() {
  const { currentUser, isAuthenticated } = useMockAuth();

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-iteso-900 to-iteso-700 p-6 text-white sm:p-8">
      <div className="relative z-10">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {isAuthenticated ? `Hola, ${currentUser?.name}` : 'Bienvenido a ReUseITESO'}
        </h1>
        <p className="mt-1 text-sm text-white/70 sm:text-base">
          {isAuthenticated
            ? 'Esto es lo nuevo en la comunidad ITESO'
            : 'Selecciona un usuario para ver tu dashboard personalizado'}
        </p>
        <div className="mt-3 h-0.5 w-16 rounded-full bg-red-500" />
      </div>
      <Recycle
        className="absolute -bottom-4 -right-4 h-32 w-32 text-white/5 sm:h-40 sm:w-40"
        strokeWidth={1}
      />
    </div>
  );
}
