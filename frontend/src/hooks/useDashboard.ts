'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient, listTransactions } from '@/lib/api';
import type { DashboardData } from '@/types/dashboard';

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient<DashboardData>('/auth/dashboard/');
      let activeTransactionsCount = response.active_transactions_count;

      try {
        const [pendingTransactions, confirmedTransactions] = await Promise.all([
          listTransactions({ status: 'pendiente' }),
          listTransactions({ status: 'confirmada' }),
        ]);

        activeTransactionsCount = pendingTransactions.count + confirmedTransactions.count;
      } catch {
        activeTransactionsCount = response.active_transactions_count;
      }

      setData({
        ...response,
        active_transactions_count: activeTransactionsCount,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el dashboard');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return { data, isLoading, error, refetch: fetchDashboard };
}
