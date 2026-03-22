'use client';

import { useAuth } from '@/hooks/useAuth';
import { useDashboard } from '@/hooks/useDashboard';
import WelcomeHeader from '@/components/dashboard/WelcomeHeader';
import QuickActions from '@/components/dashboard/QuickActions';
import StatsSummary from '@/components/dashboard/StatsSummary';
import MyListings from '@/components/dashboard/MyListings';
import RecentProducts from '@/components/dashboard/RecentProducts';

export default function Dashboard() {
  const { isAuthenticated } = useAuth();
  const { data, isLoading, error, refetch } = useDashboard();

  return (
    <div className="space-y-8 py-8">
      <WelcomeHeader />
      <QuickActions />
      {isAuthenticated && <StatsSummary data={data} isLoading={isLoading} />}
      <MyListings products={data?.user_products ?? []} totalCount={data?.user_products_count ?? 0} isLoading={isLoading} isAuthenticated={isAuthenticated} />
      <RecentProducts products={data?.recent_products ?? []} isLoading={isLoading} error={error} onRetry={refetch} />
    </div>
  );
}
