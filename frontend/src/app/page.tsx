'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">ReUseITESO</h1>
      <p className="max-w-lg text-center text-lg text-gray-600">
        Plataforma de compraventa de segunda mano para la comunidad ITESO. Publica, intercambia y
        dona artículos de forma segura.
      </p>

      {isLoading ? (
        <div className="h-10 w-40 animate-pulse rounded-lg bg-gray-200" />
      ) : isAuthenticated ? (
        <Link
          href="/products"
          className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
        >
          Ver productos
        </Link>
      ) : (
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="/auth/signin"
            className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/auth/signup"
            className="rounded-lg border border-blue-600 px-6 py-3 font-medium text-blue-600 transition-colors hover:bg-blue-50"
          >
            Crear cuenta
          </Link>
        </div>
      )}
    </main>
  );
}
