import { Package, ArrowLeftRight, Award } from 'lucide-react';

import Skeleton from '@/components/ui/Skeleton';

import type { DashboardData } from '@/types/dashboard';

interface StatsSummaryProps {
  data: DashboardData | null;
  isLoading: boolean;
}

const STATS_CONFIG = [
  {
    key: 'user_products_count' as const,
    label: 'Mis publicaciones',
    icon: Package,
    borderColor: 'border-iteso-500',
    textColor: 'text-iteso-600',
    iconColor: 'text-iteso-400',
  },
  {
    key: 'active_transactions_count' as const,
    label: 'Transacciones activas',
    icon: ArrowLeftRight,
    borderColor: 'border-emerald-500',
    textColor: 'text-emerald-600',
    iconColor: 'text-emerald-400',
  },
];

export default function StatsSummary({ data, isLoading }: StatsSummaryProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5">
            <Skeleton className="mb-2 h-8 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {STATS_CONFIG.map(stat => {
        const Icon = stat.icon;
        const value = data[stat.key];
        return (
          <div
            key={stat.key}
            className={`rounded-2xl border border-slate-200 border-l-4 ${stat.borderColor} bg-white p-5 shadow-sm`}
          >
            <div className="flex items-center justify-between">
              <p className={`text-3xl font-bold tracking-tight ${stat.textColor}`}>{value}</p>
              <Icon className={`h-5 w-5 ${stat.iconColor}`} />
            </div>
            <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
          </div>
        );
      })}

      <div className="rounded-2xl border border-slate-200 border-l-4 border-amber-400 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-3xl font-bold tracking-tight text-amber-600">
            {data.gamification.points}
          </p>
          <Award className="h-5 w-5 text-amber-400" />
        </div>
        <p className="mt-1 text-sm text-slate-500">Puntos</p>
      </div>
    </div>
  );
}
