'use client';

import Link from 'next/link';
import { ArrowLeft, History } from 'lucide-react';

import PointsHistoryCard from '@/components/gamification/PointsHistoryCard';

export default function ProfilePointsHistoryPage() {
  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            <h1 className="text-h1 font-bold text-fg">Historial de puntos</h1>
          </div>

          <Link
            href="/profile"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-fg transition-colors hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al perfil
          </Link>
        </div>

        <PointsHistoryCard />
      </div>
    </main>
  );
}
