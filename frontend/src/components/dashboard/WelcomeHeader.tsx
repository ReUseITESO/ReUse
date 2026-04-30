'use client';

import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';

export default function WelcomeHeader() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="relative overflow-hidden rounded-2xl bg-primary p-6 text-primary-fg sm:p-8">
      <div className="relative z-10">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {isAuthenticated ? `Hola, ${user?.first_name}` : 'Bienvenido a ReUseITESO'}
        </h1>
        <p className="mt-1 text-sm text-primary-fg/70 sm:text-base">
          {isAuthenticated
            ? 'Esto es lo nuevo en la comunidad ITESO'
            : 'Inicia sesion para ver tu dashboard personalizado'}
        </p>
        <div className="mt-3 h-0.5 w-16 rounded-full bg-error" />
      </div>
      <Image
        height={160}
        width={160}
        src="/ReUseITESOLogo.png"
        alt=""
        className="absolute -bottom-6 -right-6 object-contain opacity-10 sm:h-40 sm:w-40"
      />
    </div>
  );
}
