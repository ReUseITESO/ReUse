'use client';

import { useState } from 'react';

import PointsBalance from '@/components/gamification/PointsBalance';
import TestPointsButtons from '@/components/gamification/TestPointsButtons';
import BadgesList from '@/components/gamification/BadgesList';

export default function DashboardPage() {
  const [pointsVersion, setPointsVersion] = useState(0);

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-h1 font-bold text-fg">Dashboard</h1>

        <section className="space-y-6">
          <div>
            <h2 className="mb-4 text-h3 font-semibold text-fg">Mi Gamificación</h2>
            <PointsBalance refreshTrigger={pointsVersion} />
          </div>
          <TestPointsButtons onPointsUpdated={() => setPointsVersion(v => v + 1)} />

          <div>
            <h2 className="mb-4 text-h3 font-semibold text-fg">Insignias</h2>
            <BadgesList />
          </div>
        </section>
      </div>
    </main>
  );
}
