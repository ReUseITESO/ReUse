'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { getMicrosoftAuthUrl, requestReactivationEmail, ApiError } from '@/lib/auth';

export default function SignInPage() {
  const router = useRouter();
  const { signIn, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMicrosoftLoading, setIsMicrosoftLoading] = useState(false);

  // HU-CORE-17: estado para mostrar el panel de cuenta desactivada
  const [deactivatedEmail, setDeactivatedEmail] = useState<string | null>(null);
  const [isSendingReactivation, setIsSendingReactivation] = useState(false);

  async function handleMicrosoftSignIn() {
    setError('');
    setIsMicrosoftLoading(true);
    try {
      const authUrl = await getMicrosoftAuthUrl();
      window.location.href = authUrl;
    } catch {
      setError('No se pudo iniciar el flujo con Microsoft. Intenta de nuevo.');
      setIsMicrosoftLoading(false);
    }
  }

  // HU-CORE-17: solicitar email de reactivación y redirigir
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

  if (isAuthenticated) {
    router.replace('/products');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setDeactivatedEmail(null);

    if (!email.trim() || !password) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    setIsSubmitting(true);
    try {
      await signIn({ email: email.trim().toLowerCase(), password });
      router.push('/products');
    } catch (err) {
      // HU-CORE-17: detectar cuenta desactivada por código de error
      if (err instanceof ApiError && err.code === 'ACCOUNT_DEACTIVATED') {
        setDeactivatedEmail(email.trim().toLowerCase());
      } else {
        setError(err instanceof Error ? err.message : 'Error al iniciar sesión.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl bg-card p-8 shadow-lg">
        <div className="mb-8 text-center">
          <img
            src="/ReUseITESOLogo.png"
            alt="ReUseITESO logo"
            className="mx-auto mb-3 h-24 w-24 object-contain"
          />
          <h1 className="text-h1 font-bold text-fg">ReUseITESO</h1>
          <p className="mt-2 text-muted-fg">Inicia sesión con tu cuenta ITESO</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-error/20 bg-error/5 px-4 py-3 text-sm text-error">
            {error}
          </div>
        )}

        {/* HU-CORE-17: Panel de cuenta desactivada */}
        {deactivatedEmail && (
          <div className="mb-4 rounded-lg border border-warning/30 bg-warning/5 px-5 py-4">
            <p className="font-semibold text-fg mb-1">Cuenta desactivada</p>
            <p className="text-sm text-muted-fg mb-4">
              Tu cuenta está desactivada. ¿Deseas reactivarla? Te enviaremos un correo con un
              enlace para recuperar el acceso.
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
              <button
                type="button"
                onClick={() => setDeactivatedEmail(null)}
                disabled={isSendingReactivation}
                className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium
                           text-fg transition-colors hover:bg-muted disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-fg">
              Correo ITESO
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="tu.nombre@iteso.mx"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={isSubmitting}
              className="w-full rounded-lg border border-input px-4 py-2.5 text-fg placeholder-muted-fg
                         focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring
                         disabled:opacity-50"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-fg">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={isSubmitting}
              className="w-full rounded-lg border border-input px-4 py-2.5 text-fg placeholder-muted-fg
                         focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring
                         disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-btn-primary px-4 py-2.5 font-medium text-btn-primary-fg transition-colors
                       hover:bg-primary-hover disabled:opacity-50"
          >
            {isSubmitting ? 'Iniciando sesión…' : 'Iniciar sesión'}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <hr className="flex-1 border-border" />
          <span className="text-xs text-muted-fg">O continúa con</span>
          <hr className="flex-1 border-border" />
        </div>

        <button
          type="button"
          onClick={handleMicrosoftSignIn}
          disabled={isSubmitting || isMicrosoftLoading}
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-btn-tmpl-border
                     bg-btn-tmpl px-4 py-2.5 font-medium text-btn-tmpl-fg transition-colors
                     hover:bg-btn-tmpl-hover disabled:opacity-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 21 21" width="18" height="18" aria-hidden="true">
            <rect x="1" y="1" width="9" height="9" fill="#f25022" />
            <rect x="11" y="1" width="9" height="9" fill="#00a4ef" />
            <rect x="1" y="11" width="9" height="9" fill="#7fba00" />
            <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
          </svg>
          {isMicrosoftLoading ? 'Redirigiendo…' : 'Continuar con Microsoft'}
        </button>

        <p className="mt-6 text-center text-sm text-muted-fg">
          ¿No tienes cuenta?{' '}
          <Link href="/auth/signup" className="font-medium text-primary hover:text-primary-hover">
            Regístrate
          </Link>
        </p>
      </div>
    </main>
  );
}
