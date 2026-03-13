'use client';

import Link from 'next/link';

export default function VerifyNoticePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-card p-8 shadow-lg text-center">
        <div className="mb-6">
          <span className="inline-block text-5xl">📧</span>
        </div>
        <h1 className="text-h2 font-bold text-fg mb-2">
          ¡Revisa tu correo!
        </h1>
        <p className="text-muted-fg mb-6">
          Te enviamos un enlace de verificación a tu correo ITESO.
          Haz clic en el enlace para activar tu cuenta.
        </p>
        <p className="text-sm text-muted-fg mb-8">
          Si no ves el correo, revisa tu carpeta de spam.
        </p>
        <Link
          href="/auth/signin"
          className="inline-block rounded-lg bg-btn-primary px-6 py-2.5 text-btn-primary-fg font-medium hover:bg-primary-hover transition-colors"
        >
          Ir a iniciar sesión
        </Link>
      </div>
    </main>
  );
}
