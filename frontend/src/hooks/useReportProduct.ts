import { useCallback, useState } from 'react';

import { apiClient } from '@/lib/api';

interface ReportProductPayload {
  reason: string;
  description?: string;
}

export function useReportProduct() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reportProduct = useCallback(
    async (productId: number, payload: ReportProductPayload): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        await apiClient(`/marketplace/products/${productId}/report/`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'No se pudo enviar el reporte';
        setError(message);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return { reportProduct, isLoading, error };
}
