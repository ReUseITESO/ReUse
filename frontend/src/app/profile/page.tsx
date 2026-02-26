// Scaffolding: profile page stub. Add user profile component when core module is ready.
// See reglas_de_escritura_front.md section 3 (Pages) for page conventions.
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mi perfil | ReUseITESO',
  description: 'Tu perfil de estudiante en ReUseITESO',
};

export default function ProfilePage() {
  return (
    <main className="p-8">
      <h1 className="mb-6 text-2xl font-bold">Mi perfil</h1>
      {/* TODO: add profile component with user data and badges */}
    </main>
  );
}
