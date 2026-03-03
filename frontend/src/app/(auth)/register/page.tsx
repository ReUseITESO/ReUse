// Scaffolding: register page stub. Add a RegisterForm component when core auth is ready.
// See reglas_de_escritura_front.md section 3 (Pages) for page conventions.
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Registro | ReUseITESO',
  description: 'Crea tu cuenta de estudiante en ReUseITESO',
};

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <div className="w-full max-w-md">
        <h1 className="mb-6 text-center text-2xl font-bold">Crear cuenta</h1>
        {/* TODO: add RegisterForm component */}
      </div>
    </main>
  );
}
