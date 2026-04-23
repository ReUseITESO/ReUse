'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { confirmPasswordReset, ApiError } from '@/lib/auth';

export default function ResetPasswordContent() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token') ?? '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <section className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-lg text-center">
          <h1 className="text-2xl font-bold text-fg mb-3">Enlace inválido</h1>
          <p className="text-sm text-muted-fg mb-6">
            Este enlace no es válido. Solicita uno nuevo.
          </p>
          <Link
            href="/auth/forgot-password"
            className="inline-block rounded-lg bg-btn-primary px-4 py-2.5 font-medium
                       text-btn-primary-fg transition-colors hover:bg-primary-hover"
          >
            Solicitar nuevo enlace
          </Link>
        </section>
      </main>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setErrorCode('');

    if (!newPassword || !confirmPassword) {
      setError('Completa todos los campos.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setIsLoading(true);
    try {
      await confirmPasswordReset(token, newPassword, confirmPassword);
      setSuccess(true);
      setTimeout(() => router.replace('/auth/signin'), 3000);
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorCode(err.code);
        setError(err.message);
      } else {
        setError('No se pudo restablecer la contraseña. Intenta de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <main className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <section className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-lg text-center">
          <h1 className="text-2xl font-bold text-fg mb-3">Contraseña restablecida</h1>
          <p className="text-sm text-muted-fg">Redirigiendo a inicio de sesión...</p>
        </section>
      </main>
    );
  }

  const isExpiredOrUsed = errorCode === 'TOKEN_EXPIRED' || errorCode === 'TOKEN_USED';

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <section className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-fg mb-2">Nueva contraseña</h1>
        <p className="text-sm text-muted-fg mb-6">Ingresa y confirma tu nueva contraseña.</p>

        {error && (
          <div className="mb-4 rounded-lg border border-error/20 bg-error/5 px-4 py-3 text-sm text-error">
            <p>{error}</p>
            {isExpiredOrUsed && (
              <Link
                href="/auth/forgot-password"
                className="mt-2 inline-block font-medium underline"
              >
                Solicitar nuevo enlace
              </Link>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="new-password" className="mb-1 block text-sm font-medium text-fg">
              Nueva contraseña
            </label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-input px-4 py-2.5 text-fg
                         focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label htmlFor="confirm-password" className="mb-1 block text-sm font-medium text-fg">
              Confirmar contraseña
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-input px-4 py-2.5 text-fg
                         focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-btn-primary py-2.5 font-medium text-btn-primary-fg
                       transition-colors hover:bg-primary-hover disabled:opacity-50"
          >
            {isLoading ? 'Guardando...' : 'Restablecer contraseña'}
          </button>
        </form>
      </section>
    </main>
  );
}
