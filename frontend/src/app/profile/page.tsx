// Scaffolding: profile page stub. Add user profile component when core module is ready.
// See reglas_de_escritura_front.md section 3 (Pages) for page conventions.
import type { Metadata } from 'next';
import BadgesList from '@/components/gamification/BadgesList';

export const metadata: Metadata = {
  title: 'Mi perfil | ReUseITESO',
  description: 'Tu perfil de estudiante en ReUseITESO',
};

export default function ProfilePage() {
  return (
    <main className="p-8 max-w-7xl mx-auto">
      <h1 className="mb-6 text-2xl font-bold">Mi perfil</h1>

      <section className="mt-8">
        <h2 className="mb-4 text-xl font-semibold border-b pb-2">Logros y Medallas</h2>
        <BadgesList />
      </section>
    </main>
  );
}
