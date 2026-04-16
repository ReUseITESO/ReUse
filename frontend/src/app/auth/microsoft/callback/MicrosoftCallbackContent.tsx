'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { type ApiError, requestReactivationEmail } from '@/lib/auth';

export default function MicrosoftCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signInWithMicrosoft } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [deactivatedEmail, setDeactivatedEmail] = useState<string | null>(null);
  const [isSendingReactivation, setIsSendingReactivation] = useState(false);
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

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
      .catch(err => {
        const apiErr = err as ApiError;
        const isDeactivated =
          apiErr?.code === 'ACCOUNT_DEACTIVATED' ||
          (err instanceof Error && err.message.includes('desactivada'));
        if (isDeactivated) {
          setDeactivatedEmail(apiErr?.email ?? '');
        } else {
          setError(err instanceof Error ? err.message : 'Error al autenticar con Microsoft.');
        }
      });
  }, []);

  async function handleRequestReactivation() {
    if (!deactivatedEmail) return;
    setIsSendingReactivation(true);
    try {
      await requestReactivationEmail(deactivatedEmail);
      router.push('/auth/reactivate-notice');
    } catch {
      setError('No se pudo enviar el correo de reactivación. Intenta de nuevo.');
      setDeactivatedEmail(null);
    } finally {
      setIsSendingReactivation(false);
    }
  }

  if (deactivatedEmail !== null) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md rounded-2xl bg-card p-8 shadow-lg text-center">
          <div className="mb-4 rounded-lg border border-warning/30 bg-warning/5 px-5 py-4 text-left">
            <p className="font-semibold text-fg mb-1">Cuenta desactivada</p>
            <p className="text-sm text-muted-fg mb-4">
              Tu cuenta está desactivada. ¿Deseas reactivarla? Te enviaremos un correo a{' '}
              <span className="font-medium text-fg">{deactivatedEmail}</span> con un enlace para
              recuperar el acceso.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleRequestReactivation}
                disabled={isSendingReactivation}
                className="flex-1 rounded-lg bg-btn-primary px-4 py-2 text-sm font-medium
                           text-btn-primary-fg transition-colors hover:bg-primary-hover disabled:opacity-50"
              >
                {isSendingReactivation ? 'Enviando…' : 'Reactivar por correo'}
              </button>
              <Link
                href="/auth/signin"
                className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium
                           text-fg transition-colors hover:bg-muted text-center"
              >
                Cancelar
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

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
