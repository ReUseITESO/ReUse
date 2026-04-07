'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function MicrosoftCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signInWithMicrosoft } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      setError('El inicio de sesión con Microsoft fue cancelado o rechazado.');
      return;
    }

    if (!code) {
      setError('No se recibió el código de autorización de Microsoft.');
      return;
    }

    signInWithMicrosoft(code)
      .then(() => router.replace('/products'))
      .catch(err =>
        setError(err instanceof Error ? err.message : 'Error al autenticar con Microsoft.'),
      );
  }, []);

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md rounded-2xl bg-card p-8 shadow-lg text-center">
          <div className="mb-4 rounded-lg border border-error/20 bg-error/5 px-4 py-3 text-sm text-error">
            {error}
          </div>
          <Link
            href="/auth/signin"
            className="text-sm font-medium text-primary hover:text-primary-hover"
          >
            Volver al inicio de sesión
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl bg-card p-8 shadow-lg text-center">
        <p className="text-fg">Autenticando con Microsoft...</p>
      </div>
    </main>
  );
}
