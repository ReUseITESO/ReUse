'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function SignInPage() {
  const router = useRouter();
  const { signIn, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    router.replace('/products');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    setIsSubmitting(true);
    try {
      await signIn({ email: email.trim().toLowerCase(), password });
      router.push('/products');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión.');
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
