'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type ConfirmResponse = {
  message?: string;
  user?: any;
  tokens?: { access: string; refresh: string };
  error?: { code?: string; message?: string };
};

export default function VerifyContent() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const run = async () => {
      if (!token) {
        setStatus('error');
        setErrorMsg('Token faltante.');
        return;
      }

      const base = process.env.NEXT_PUBLIC_API_URL;
      if (!base) {
        setStatus('error');
        setErrorMsg('NEXT_PUBLIC_API_URL no está definido en el frontend (.env.local).');
        return;
      }

      try {
        const res = await fetch(
          `${base}/auth/email-verification/confirm/?token=${encodeURIComponent(token)}`,
          { method: 'GET', headers: { Accept: 'application/json' } },
        );

        const data: ConfirmResponse | null = await res.json().catch(() => null);

        if (!res.ok) {
          const code = data?.error?.code;
          const msg = data?.error?.message || 'No se pudo verificar el correo.';

          if (code === 'TOKEN_USED') {
            setStatus('success');
            setTimeout(() => window.location.replace('/'), 900);
            return;
          }

          setStatus('error');
          setErrorMsg(msg);
          return;
        }

        const payload = data as ConfirmResponse;

        if (!payload?.tokens?.access || !payload?.tokens?.refresh) {
          setStatus('error');
          setErrorMsg(
            'Correo verificado, pero el servidor no devolvió tokens para iniciar sesión.',
          );
          return;
        }

        localStorage.setItem('reuse_access_token', payload.tokens.access);
        localStorage.setItem('reuse_refresh_token', payload.tokens.refresh);

        setStatus('success');

        setTimeout(() => window.location.replace('/'), 1200);
      } catch {
        setStatus('error');
        setErrorMsg('Error de red verificando el correo.');
      }
    };

    run();
  }, [token]);

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg border border-gray-100 text-center">
        {status === 'loading' && (
          <>
            <h2 className="text-2xl font-bold text-gray-900">Verificando tu correo...</h2>
            <p className="mt-3 text-gray-600">Esto puede tardar unos segundos.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <h2 className="text-2xl font-bold text-gray-900">Verificación completada</h2>
            <p className="mt-3 text-gray-600">Iniciando sesión automáticamente...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <h2 className="text-2xl font-bold text-gray-900">No se pudo verificar</h2>
            <p className="mt-3 text-gray-600">{errorMsg}</p>

            <div className="mt-6">
              <button
                onClick={() => router.replace('/auth/signin')}
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white hover:bg-blue-700 transition-colors"
              >
                Ir a iniciar sesión
              </button>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
