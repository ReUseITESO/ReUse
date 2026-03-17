'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col">
      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-20 text-center">
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
            La plataforma de compraventa, intercambio y donación de segunda mano para la comunidad
            ITESO. Sostenible, segura y hecha por estudiantes.
          </p>
        </div>

        {isLoading ? (
          <div className="flex gap-3">
            <div className="h-12 w-36 animate-pulse rounded-lg bg-muted" />
            <div className="h-12 w-36 animate-pulse rounded-lg bg-muted" />
          </div>
        ) : isAuthenticated ? (
          <Link
            href="/products"
            className="rounded-lg bg-btn-primary px-8 py-3 font-medium text-btn-primary-fg shadow-sm transition-colors hover:bg-primary-hover"
          >
            Explorar productos
          </Link>
        ) : (
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <Link
              href="/auth/signin"
              className="rounded-lg bg-btn-primary px-8 py-3 font-medium text-btn-primary-fg shadow-sm transition-colors hover:bg-primary-hover"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/auth/signup"
              className="rounded-lg border border-btn-tmpl-border px-8 py-3 font-medium text-primary transition-colors hover:bg-btn-tmpl-hover"
            >
              Crear cuenta gratis
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
