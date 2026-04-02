'use client';

import { useState } from 'react';

import BadgesList from '@/components/gamification/BadgesList';
import ChallengesBoard from '@/components/gamification/ChallengesBoard';
import PointsBalance from '@/components/gamification/PointsBalance';
import PointsHistoryCard from '@/components/gamification/PointsHistoryCard';
import TestPointsButtons from '@/components/gamification/TestPointsButtons';

export default function DashboardPage() {
  const [pointsVersion, setPointsVersion] = useState(0);

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-h1 font-bold text-fg">Dashboard</h1>

        <section className="space-y-6">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <h2 className="mb-3 text-lg font-semibold text-amber-900">
              Acciones de prueba para retos
            </h2>
            <p className="mb-3 text-sm text-amber-800">
              Usa estos botones para simular acciones y actualizar el progreso de tus retos.
            </p>
            <TestPointsButtons onPointsUpdated={() => setPointsVersion(v => v + 1)} />
          </div>

          <div>
            <h2 className="mb-4 text-h3 font-semibold text-fg">Mi Gamificación</h2>
            <PointsBalance refreshTrigger={pointsVersion} />
          </div>

          <div>
            <h2 className="mb-4 text-h3 font-semibold text-fg">Insignias</h2>
            <BadgesList />
          </div>

          <div>
            <h2 className="mb-4 text-h3 font-semibold text-fg">Historial y desglose</h2>
            <PointsHistoryCard />
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
