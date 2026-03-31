'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import Dashboard from '@/components/dashboard/Dashboard';

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-10 w-40 animate-pulse rounded-lg bg-muted" />
      </main>
    );
  }

  if (isAuthenticated) {
    return <Dashboard />;
  }

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-8 px-6 py-20 text-center">
      <div className="flex flex-col items-center gap-4">
        <img
          src="/ReUseITESOLogo.png"
          alt="ReUseITESO"
          className="h-28 w-28 object-contain drop-shadow-md"
        />
        <h1 className="text-4xl font-bold text-fg sm:text-5xl">
          ReUse<span className="text-primary">ITESO</span>
        </h1>
        <p className="max-w-xl text-body text-muted-fg">
          La plataforma de compraventa, intercambio y donacion de segunda mano para la comunidad
          ITESO. Sostenible, segura y hecha por estudiantes.
        </p>
      </div>
      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <Link
          href="/auth/signin"
          className="rounded-lg bg-btn-primary px-8 py-3 font-medium text-btn-primary-fg shadow-sm transition-colors hover:bg-primary-hover"
        >
          Iniciar sesion
        </Link>
        <Link
          href="/auth/signup"
          className="rounded-lg border border-btn-tmpl-border px-8 py-3 font-medium text-primary transition-colors hover:bg-btn-tmpl-hover"
        >
          Crear cuenta gratis
        </Link>
      </div>
    </main>
  );
}
