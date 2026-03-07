'use client';

import Link from 'next/link';

export default function VerifyNoticePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg text-center">
        <div className="mb-6">
          <span className="inline-block text-5xl">📧</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          ¡Revisa tu correo!
        </h1>
        <p className="text-gray-600 mb-6">
          Te enviamos un enlace de verificación a tu correo ITESO.
          Haz clic en el enlace para activar tu cuenta.
        </p>
        <p className="text-sm text-gray-500 mb-8">
          Si no ves el correo, revisa tu carpeta de spam.
        </p>
        <Link
          href="/auth/signin"
          className="inline-block rounded-lg bg-blue-600 px-6 py-2.5 text-white font-medium hover:bg-blue-700 transition-colors"
        >
          Ir a iniciar sesión
        </Link>
      </div>
    </main>
  );
}
