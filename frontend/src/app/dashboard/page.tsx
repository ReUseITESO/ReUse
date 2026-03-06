'use client';

import { useState } from 'react';
import PointsBalance from '@/components/gamification/PointsBalance';
import BadgesList from '@/components/gamification/BadgesList';
import TestPointsButtons from '@/components/gamification/TestPointsButtons';

export default function DashboardPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePointsChanged = () => {
    setRefreshKey((key) => key + 1);
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold text-slate-900">Dashboard</h1>

        <section className="space-y-6">
          {/* Puntos */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-slate-800">Mi Gamificación</h2>
            <PointsBalance key={refreshKey} />
          </div>

          {/* Logros/Badges */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-slate-800">🏆 Mis Logros</h2>
            <BadgesList key={refreshKey} />
          </div>

          {/* Botones de Prueba */}
          <TestPointsButtons onPointsChanged={handlePointsChanged} />
        </section>
      </div>
    </main>
  );
}
