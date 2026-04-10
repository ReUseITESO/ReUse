'use client';

import { useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { cn } from '@/lib/utils';

interface TestPointsButtonsProps {
  onPointsUpdated?: () => void;
  onPointsChanged?: () => void;
}

export default function TestPointsButtons({
  onPointsUpdated,
  onPointsChanged,
}: Readonly<TestPointsButtonsProps>) {
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const notifyPointsUpdate = () => {
    onPointsUpdated?.();
    onPointsChanged?.();
  };

  const runAction = async (action: string) => {
    if (!isAuthenticated) {
      setMessage({ type: 'error', text: 'Inicia sesion para probar acciones de puntos' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      await apiClient('/gamification/award-points/', {
        method: 'POST',
        body: JSON.stringify({ action, user_id: user?.id }),
      });
      setMessage({ type: 'success', text: `Accion aplicada: ${action}` });
      notifyPointsUpdate();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'No se pudo otorgar puntos',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deduct = async (points: number) => {
    if (!isAuthenticated) {
      setMessage({ type: 'error', text: 'Inicia sesion para probar acciones de puntos' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      await apiClient('/gamification/deduct-points/', {
        method: 'POST',
        body: JSON.stringify({ points, user_id: user?.id }),
      });
      setMessage({ type: 'success', text: `Descuento aplicado: -${points} puntos` });
      notifyPointsUpdate();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'No se pudo descontar puntos',
      });
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
          onClick={() => runAction('complete_exchange')}
          disabled={!isAuthenticated || isLoading}
          className="rounded-md bg-indigo-100 px-3 py-2 text-sm font-medium text-indigo-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Intercambio (+)
        </button>
        <button
          type="button"
          onClick={() => runAction('complete_sale')}
          disabled={!isAuthenticated || isLoading}
          className="rounded-md bg-cyan-100 px-3 py-2 text-sm font-medium text-cyan-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Venta (+)
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
            message.type === 'error' ? 'text-red-600' : 'text-emerald-700',
          )}
        >
          {message.text}
        </p>
      ) : null}
    </section>
  );
}
