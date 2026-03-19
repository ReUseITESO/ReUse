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
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'No se pudo otorgar puntos' });
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
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'No se pudo descontar puntos' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h3 className="mb-3 text-sm font-semibold text-slate-900">Botones de prueba</h3>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
        <button
          type="button"
          onClick={() => runAction('publish_item')}
          disabled={!isAuthenticated || isLoading}
          className="rounded-md bg-blue-100 px-3 py-2 text-sm font-medium text-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Publicar (+)
        </button>
        <button
          type="button"
          onClick={() => runAction('complete_donation')}
          disabled={!isAuthenticated || isLoading}
          className="rounded-md bg-green-100 px-3 py-2 text-sm font-medium text-green-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Donacion (+)
        </button>
        <button
          type="button"
          onClick={() => runAction('receive_positive_review')}
          disabled={!isAuthenticated || isLoading}
          className="rounded-md bg-purple-100 px-3 py-2 text-sm font-medium text-purple-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Review (+)
        </button>
        <button
          type="button"
          onClick={() => deduct(5)}
          disabled={!isAuthenticated || isLoading}
          className="rounded-md bg-red-100 px-3 py-2 text-sm font-medium text-red-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Restar 5
        </button>
      </div>
      {message ? (
        <p className={cn('mt-3 text-xs', message.type === 'error' ? 'text-red-600' : 'text-emerald-700')}>
          {message.text}
        </p>
      ) : null}
    </section>
  );
}
