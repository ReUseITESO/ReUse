import Link from 'next/link';

export default function ReactivateNoticePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl bg-card p-8 shadow-lg text-center">
        <h1 className="text-h1 font-bold text-fg mb-3">Revisa tu correo</h1>
        <p className="text-muted-fg mb-6">
          Te enviamos un enlace de reactivación. Abre el correo y sigue las instrucciones. El enlace
          expira en 60 minutos.
        </p>
        <Link
          href="/auth/signin"
          className="text-sm font-medium text-primary hover:text-primary-hover"
        >
          Volver a iniciar sesión
        </Link>
      </div>
    </main>
  );
}
