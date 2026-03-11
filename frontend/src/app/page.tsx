'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import Dashboard from '@/components/dashboard/Dashboard';

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-10 w-40 animate-pulse rounded-lg bg-slate-200" />
      </main>
    );
  }

  if (isAuthenticated) {
    return <Dashboard />;
  }

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-4xl font-bold text-slate-900 sm:text-5xl">ReUseITESO</h1>
      <p className="max-w-lg text-center text-lg text-slate-600">
        Plataforma de compraventa de segunda mano para la comunidad ITESO.
        Publica, intercambia y dona articulos de forma segura.
      </p>
      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <Link
          href="/auth/signin"
          className="rounded-xl bg-iteso-800 px-6 py-3 font-medium text-white transition-colors hover:bg-iteso-700"
        >
          Iniciar sesion
        </Link>
        <Link
          href="/auth/signup"
          className="rounded-xl border border-iteso-800 px-6 py-3 font-medium text-iteso-800 transition-colors hover:bg-iteso-50"
        >
          Crear cuenta
        </Link>
      </div>
    </main>
  );
}
