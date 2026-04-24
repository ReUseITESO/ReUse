'use client';

import { useSearchParams } from 'next/navigation';

export default function CheckEmailContent() {
  const params = useSearchParams();
  const email = params.get('email');
  const isResend = params.get('resend') === 'true';

  return (
    <main className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <section className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-lg">
        <h2 className="text-2xl font-bold text-fg">
          {isResend ? 'Correo reenviado' : 'Cuenta creada'}
        </h2>

        <p className="mt-3 leading-relaxed text-muted-fg">
          {isResend
            ? 'Te reenviamos el correo de verificación'
            : 'Te enviamos un correo de verificación'}
          {email ? (
            <>
              {' '}
              a <span className="font-medium text-fg">{email}</span>
            </>
          ) : null}
          . Revisa tu bandeja y spam.
        </p>

        <p className="mt-4 text-sm text-muted-fg">
          {isResend
            ? 'Abre el enlace del correo para activar tu cuenta e iniciar sesión.'
            : 'Cuando verifiques, se iniciará sesión automáticamente'}
        </p>
      </section>
    </main>
  );
}
