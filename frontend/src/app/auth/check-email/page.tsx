'use client';

import { useSearchParams } from 'next/navigation';

export default function CheckEmailPage() {
  const params = useSearchParams();
  const email = params.get('email');

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg border border-gray-100 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Cuenta creada</h2>

        <p className="mt-3 text-gray-600 leading-relaxed">
          Te enviamos un correo de verificación{email ? ` a ` : ''}{email ? (
            <span className="font-medium text-gray-900">{email}</span>
          ) : null}
          . Revisa tu bandeja y spam.
        </p>

        <p className="mt-4 text-sm text-gray-500">
          Cuando verifiques, se iniciará sesión automáticamente.
        </p>
      </section>
    </main>
  );
}