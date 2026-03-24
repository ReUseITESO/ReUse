import { Package, ArrowLeftRight, Award } from 'lucide-react';
import type { DashboardData } from '@/types/dashboard';

interface StatsSummaryProps { data: DashboardData | null; isLoading: boolean; }

export default function StatsSummary({ data, isLoading }: StatsSummaryProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-2 h-8 w-16 animate-pulse rounded bg-muted" />
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    );
  }
  if (!data) return null;

  const stats = [
    { value: data.user_products_count, label: 'Mis publicaciones', icon: Package, border: 'border-l-primary', text: 'text-primary', iconColor: 'text-primary/50' },
    { value: data.active_transactions_count, label: 'Transacciones activas', icon: ArrowLeftRight, border: 'border-l-success', text: 'text-success', iconColor: 'text-success/50' },
    { value: data.gamification.points, label: 'Puntos', icon: Award, border: 'border-l-warning', text: 'text-warning', iconColor: 'text-warning/50' },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {stats.map(s => {
        const Icon = s.icon;
        return (
          <div key={s.label} className={`rounded-2xl border border-border border-l-4 ${s.border} bg-card p-5 shadow-sm`}>
            <div className="flex items-center justify-between">
              <p className={`text-3xl font-bold tracking-tight ${s.text}`}>{s.value}</p>
              <Icon className={`h-5 w-5 ${s.iconColor}`} />
            </div>
            <p className="mt-1 text-sm text-muted-fg">{s.label}</p>
          </div>
        );
      })}
    </div>
  );
}
