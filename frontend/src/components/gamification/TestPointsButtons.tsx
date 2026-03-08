'use client';

import { useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { cn } from '@/lib/utils';

interface TestPointsButtonsProps {
  onPointsUpdated?: () => void;
}

export default function TestPointsButtons({ onPointsUpdated }: TestPointsButtonsProps) {
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  const runAction = async (action: string) => {
    setIsLoading(true);
    setMessage(null);
    setIsError(false);

    try {
      await apiClient('/gamification/award-points/', {
        method: 'POST',
        body: JSON.stringify({ action }),
      });
      setMessage(`Accion aplicada: ${action}`);
      onPointsUpdated?.();
    } catch (err) {
      setIsError(true);
      setMessage(err instanceof Error ? err.message : 'No se pudo otorgar puntos');
    } finally {
      setIsLoading(false);
    }
  };

  const deduct = async (points: number) => {
    setIsLoading(true);
    setMessage(null);
    setIsError(false);

    try {
      await apiClient('/gamification/deduct-points/', {
        method: 'POST',
        body: JSON.stringify({ points }),
      });
      setMessage(`Descuento aplicado: -${points} puntos`);
      onPointsUpdated?.();
    } catch (err) {
      setIsError(true);
      setMessage(err instanceof Error ? err.message : 'No se pudo descontar puntos');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="rounded-lg border border-border bg-card p-4">
      <h3 className="mb-3 text-sm font-semibold text-fg">Botones de prueba</h3>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
        <button
          type="button"
          onClick={() => runAction('publish_item')}
          disabled={!isAuthenticated || isLoading}
          className="rounded-md bg-info/10 px-3 py-2 text-sm font-medium text-info disabled:cursor-not-allowed disabled:opacity-60"
        >
          Publicar (+)
        </button>
        <button
          type="button"
          onClick={() => runAction('complete_donation')}
          disabled={!isAuthenticated || isLoading}
          className="rounded-md bg-success/10 px-3 py-2 text-sm font-medium text-success disabled:cursor-not-allowed disabled:opacity-60"
        >
          Donacion (+)
        </button>
        <button
          type="button"
          onClick={() => runAction('receive_positive_review')}
          disabled={!isAuthenticated || isLoading}
          className="rounded-md bg-secondary/10 px-3 py-2 text-sm font-medium text-secondary disabled:cursor-not-allowed disabled:opacity-60"
        >
          Review (+)
        </button>
        <button
          type="button"
          onClick={() => deduct(5)}
          disabled={!isAuthenticated || isLoading}
          className="rounded-md bg-error/10 px-3 py-2 text-sm font-medium text-error disabled:cursor-not-allowed disabled:opacity-60"
        >
          Restar 5
        </button>
      </div>
      {message ? (
        <p
          className={cn(
            'mt-3 text-xs',
            isError ? 'text-error' : 'text-success',
          )}
        >
          {message}
        </p>
      ) : null}
    </section>
  );
}
