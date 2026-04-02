'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { apiClient } from '@/lib/api';
import type { PaginatedResponse } from '@/types/api';
import type { PointHistoryEntry, PointsHistoryFilters } from '@/types/gamification';

const DEFAULT_FILTERS: Required<Pick<PointsHistoryFilters, 'ordering'>> = {
  ordering: '-created_at',
};

export function usePointsHistory(enabled: boolean = true) {
  const [entries, setEntries] = useState<PointHistoryEntry[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PointsHistoryFilters>(DEFAULT_FILTERS);
  const activeFiltersRef = useRef<PointsHistoryFilters>(DEFAULT_FILTERS);

  const fetchHistory = useCallback(
    async (nextFilters: PointsHistoryFilters = activeFiltersRef.current, nextPage: number = 1) => {
      if (!enabled) {
        setEntries([]);
        setCount(0);
        setHasNextPage(false);
        setHasPrevPage(false);
        setPage(1);
        setError(null);
        setIsLoading(false);
        return;
      }

      if (
        nextFilters.start_date &&
        nextFilters.end_date &&
        nextFilters.start_date > nextFilters.end_date
      ) {
        setError('La fecha inicial no puede ser mayor que la fecha final.');
        setEntries([]);
        setCount(0);
        setHasNextPage(false);
        setHasPrevPage(false);
        setPage(nextPage);
        return;
      }

      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (nextFilters.start_date) params.set('start_date', nextFilters.start_date);
      if (nextFilters.end_date) params.set('end_date', nextFilters.end_date);
      if (nextFilters.action) params.set('action', nextFilters.action);
      if (nextFilters.ordering) params.set('ordering', nextFilters.ordering);
      if (nextPage > 1) params.set('page', String(nextPage));

      const query = params.toString() ? `?${params.toString()}` : '';

      try {
        const response = await apiClient<PaginatedResponse<PointHistoryEntry>>(
          `/gamification/points/history/${query}`,
        );
        activeFiltersRef.current = nextFilters;
        setEntries(response.results);
        setCount(response.count);
        setHasNextPage(Boolean(response.next));
        setHasPrevPage(Boolean(response.previous));
        setPage(nextPage);
        setFilters(nextFilters);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'No se pudo cargar el historial de puntos. Intenta de nuevo.';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [enabled],
  );

  useEffect(() => {
    fetchHistory(DEFAULT_FILTERS, 1);
  }, [fetchHistory]);

  return {
    entries,
    count,
    page,
    hasNextPage,
    hasPrevPage,
    isLoading,
    error,
    filters,
    fetchHistory,
  };
}
