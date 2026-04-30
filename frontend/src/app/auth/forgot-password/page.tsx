'use client';

import { useState } from 'react';
import Link from 'next/link';
import { requestPasswordReset } from '@/lib/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError('Ingresa tu correo electrónico.');
      return;
    }
    setIsLoading(true);
    try {
      await requestPasswordReset(email.trim().toLowerCase());
      setSubmitted(true);
    } catch {
      setError('No se pudo enviar el correo. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResend() {
    setError('');
    setIsLoading(true);
    try {
      await requestPasswordReset(email.trim().toLowerCase());
    } catch {
      setError('No se pudo reenviar el correo. Intenta de nuevo más tarde.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <section className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-lg">
        {!submitted ? (
          <>
            <h1 className="text-2xl font-bold text-fg mb-2">¿Olvidaste tu contraseña?</h1>
            <p className="text-sm text-muted-fg mb-6">
              Ingresa tu correo y te enviaremos un enlace para crear una nueva contraseña.
            </p>

            {error && (
              <div className="mb-4 rounded-lg border border-error/20 bg-error/5 px-4 py-3 text-sm text-error">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium text-fg">
                  Correo electrónico
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tu.correo@iteso.mx"
                  className="w-full rounded-lg border border-border bg-input px-4 py-2.5 text-fg
                             placeholder:text-muted-fg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg bg-btn-primary py-2.5 font-medium text-btn-primary-fg
                           transition-colors hover:bg-primary-hover disabled:opacity-50"
              >
                {isLoading ? 'Enviando...' : 'Enviar enlace'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-fg">
              <Link href="/auth/signin" className="font-medium text-primary hover:underline">
                Volver a inicio de sesión
              </Link>
            </p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-fg mb-2">Revisa tu correo</h1>
            <p className="text-sm text-muted-fg mb-2">
              Si <span className="font-medium text-fg">{email.trim().toLowerCase()}</span> está
              registrado, recibirás un enlace para restablecer tu contraseña.
            </p>
            <p className="text-sm text-muted-fg mb-6">
              El enlace expira en 60 minutos. Si no lo encuentras, revisa tu carpeta de spam.
            </p>

            {error && (
              <div className="mb-4 rounded-lg border border-error/20 bg-error/5 px-4 py-3 text-sm text-error">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleResend}
              disabled={isLoading}
              className="w-full rounded-lg border border-border py-2.5 text-sm font-medium text-fg
                         transition-colors hover:bg-muted disabled:opacity-50 mb-3"
            >
              {isLoading ? 'Reenviando...' : 'Reenviar correo'}
            </button>

            <p className="text-center text-sm text-muted-fg">
              <Link href="/auth/signin" className="font-medium text-primary hover:underline">
                Volver a inicio de sesión
              </Link>
            </p>
          </>
        )}
      </section>
    </main>
  );
}
