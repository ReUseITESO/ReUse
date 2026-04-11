'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { confirmReactivation, ApiError } from '@/lib/auth';

export default function ReactivateContent() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const run = async () => {
      if (!token) {
        setStatus('error');
        setErrorMsg('Token faltante en la URL.');
        return;
      }

      try {
        await confirmReactivation(token);
        setStatus('success');
        setTimeout(() => router.replace('/auth/signin'), 2000);
      } catch (err) {
        // TOKEN_USED significa que ya fue reactivado antes — tratar como éxito
        if (err instanceof ApiError && err.code === 'TOKEN_USED') {
          setStatus('success');
          setTimeout(() => router.replace('/auth/signin'), 2000);
          return;
        }
        setStatus('error');
        setErrorMsg(err instanceof ApiError ? err.message : 'No se pudo reactivar la cuenta.');
      }
    };

    run();
  }, [token, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl bg-card p-8 shadow-lg text-center">
        {status === 'loading' && (
          <>
            <h1 className="text-h1 font-bold text-fg mb-3">Reactivando cuenta...</h1>
            <p className="text-muted-fg">Esto tomará un momento.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <h1 className="text-h1 font-bold text-fg mb-3">Cuenta reactivada</h1>
            <p className="text-muted-fg">Redirigiendo a inicio de sesión...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <h1 className="text-h1 font-bold text-fg mb-3">No se pudo reactivar</h1>
            <p className="text-muted-fg mb-6">{errorMsg}</p>
            <button
              onClick={() => router.replace('/auth/signin')}
              className="rounded-lg bg-btn-primary px-4 py-2.5 font-medium text-btn-primary-fg
                         hover:bg-primary-hover transition-colors"
            >
              Ir a iniciar sesión
            </button>
          </>
        )}
      </div>
    </main>
  );
}
