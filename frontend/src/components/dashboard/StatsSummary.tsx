import { Package, ArrowLeftRight, Award } from 'lucide-react';

import type { DashboardData } from '@/types/dashboard';

interface StatsSummaryProps {
  data: DashboardData | null;
  isLoading: boolean;
}

export default function StatsSummary({ data, isLoading }: StatsSummaryProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-2 h-8 w-16 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
          </div>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const stats = [
    {
      value: data.user_products_count,
      label: 'Mis publicaciones',
      icon: Package,
      borderColor: 'border-l-iteso-500',
      textColor: 'text-iteso-600',
      iconColor: 'text-iteso-400',
    },
    {
      value: data.active_transactions_count,
      label: 'Transacciones activas',
      icon: ArrowLeftRight,
      borderColor: 'border-l-emerald-500',
      textColor: 'text-emerald-600',
      iconColor: 'text-emerald-400',
    },
    {
      value: data.gamification.points,
      label: 'Puntos',
      icon: Award,
      borderColor: 'border-l-amber-400',
      textColor: 'text-amber-600',
      iconColor: 'text-amber-400',
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {stats.map(stat => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className={`rounded-2xl border border-slate-200 border-l-4 ${stat.borderColor} bg-white p-5 shadow-sm`}
          >
            <div className="flex items-center justify-between">
              <p className={`text-3xl font-bold tracking-tight ${stat.textColor}`}>
                {stat.value}
              </p>
              <Icon className={`h-5 w-5 ${stat.iconColor}`} />
            </div>
            <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
          </div>
        );
      })}
    </div>
  );
}
