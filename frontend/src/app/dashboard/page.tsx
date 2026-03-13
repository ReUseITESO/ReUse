'use client';

import { useState } from 'react';

import PointsBalance from '@/components/gamification/PointsBalance';
import TestPointsButtons from '@/components/gamification/TestPointsButtons';
import BadgesList from '@/components/gamification/BadgesList';

export default function DashboardPage() {
  const [pointsVersion, setPointsVersion] = useState(0);

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold text-slate-900">Dashboard</h1>

        <section className="space-y-6">
          <div>
            <h2 className="mb-4 text-lg font-semibold text-slate-800">Mi Gamificación</h2>
            <PointsBalance refreshTrigger={pointsVersion} />
          </div>
          <TestPointsButtons onPointsUpdated={() => setPointsVersion(v => v + 1)} />

          <div>
            <h2 className="mb-4 text-lg font-semibold text-slate-800">Insignias</h2>
            <BadgesList />
          </div>
        </section>
      </div>
    </main>
  );
}
