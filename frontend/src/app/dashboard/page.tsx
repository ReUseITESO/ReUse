'use client';

import { useState } from 'react';

import PointsBalance from '@/components/gamification/PointsBalance';
import TestPointsButtons from '@/components/gamification/TestPointsButtons';
import BadgesList from '@/components/gamification/BadgesList';
import ChallengesBoard from '@/components/gamification/ChallengesBoard';

export default function DashboardPage() {
  const [pointsVersion, setPointsVersion] = useState(0);

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold text-slate-900">Dashboard</h1>

        <section className="space-y-6">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <h2 className="mb-3 text-lg font-semibold text-amber-900">
              Acciones de prueba para retos
            </h2>
            <p className="mb-3 text-sm text-amber-800">
              Usa estos botones para simular acciones y actualizar el progreso de tus retos.
            </p>
            <TestPointsButtons onPointsUpdated={() => setPointsVersion((v) => v + 1)} />
          </div>

          <div>
            <h2 className="mb-4 text-lg font-semibold text-slate-800">Mi Gamificación</h2>
            <PointsBalance refreshTrigger={pointsVersion} />
          </div>
          <TestPointsButtons onPointsUpdated={() => setPointsVersion(v => v + 1)} />
          <div>
            <h2 className="mb-4 text-lg font-semibold text-slate-800">Insignias</h2>
            <BadgesList />
          </div>

          <div>
            <h2 className="mb-4 text-lg font-semibold text-slate-800">Retos</h2>
            <ChallengesBoard refreshTrigger={pointsVersion} />
          </div>
        </section>
      </div>
    </main>
  );
}
