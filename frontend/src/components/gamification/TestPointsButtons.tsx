'use client';

import { useState } from 'react';
import { useMockAuth } from '@/context/MockAuthContext';
import { apiClient } from '@/lib/api';
import { cn } from '@/lib/utils';

interface TestPointsButtonsProps {
  onPointsChanged?: () => void;
}

export default function TestPointsButtons({ onPointsChanged }: TestPointsButtonsProps) {
  const { currentUser, isAuthenticated } = useMockAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleAwardPoints = async (action: string) => {
    if (!isAuthenticated || !currentUser) {
      setMessage({ type: 'error', text: 'Selecciona un usuario primero' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await apiClient('/gamification/award-points/', {
        method: 'POST',
        body: JSON.stringify({
          user_id: currentUser.id,
          action: action,
        }),
      });

      setMessage({ type: 'success', text: ` ¡Puntos otorgados por "${action}"!` });
      onPointsChanged?.();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al añadir puntos';
      setMessage({ type: 'error', text: ` ${errorMsg}` });
    } finally {
      setLoading(false);
    }
  };

  const handleDeductPoints = async (points: number) => {
    if (!isAuthenticated || !currentUser) {
      setMessage({ type: 'error', text: 'Selecciona un usuario primero' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await apiClient('/gamification/deduct-points/', {
        method: 'POST',
        body: JSON.stringify({
          user_id: currentUser.id,
          points,
        }),
      });

      setMessage({ type: 'success', text: ` ¡${points} puntos restados!` });
      onPointsChanged?.();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al restar puntos';
      setMessage({ type: 'error', text: ` ${errorMsg}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold text-gray-900">🧪 Botones de Prueba</h3>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <button
            onClick={() => handleAwardPoints('publish_item')}
            disabled={loading || !isAuthenticated}
            className={cn(
              'rounded-md px-3 py-2 text-sm font-medium transition-colors',
              'bg-blue-100 text-blue-700 hover:bg-blue-200',
              'disabled:opacity-50 disabled:cursor-not-allowed',
            )}
          >
            📝 Publicar
          </button>

          <button
            onClick={() => handleAwardPoints('complete_donation')}
            disabled={loading || !isAuthenticated}
            className={cn(
              'rounded-md px-3 py-2 text-sm font-medium transition-colors',
              'bg-green-100 text-green-700 hover:bg-green-200',
              'disabled:opacity-50 disabled:cursor-not-allowed',
            )}
          >
            🎁 Donación
          </button>

          <button
            onClick={() => handleAwardPoints('complete_sale')}
            disabled={loading || !isAuthenticated}
            className={cn(
              'rounded-md px-3 py-2 text-sm font-medium transition-colors',
              'bg-purple-100 text-purple-700 hover:bg-purple-200',
              'disabled:opacity-50 disabled:cursor-not-allowed',
            )}
          >
            💳 Venta
          </button>

          <button
            onClick={() => handleAwardPoints('complete_exchange')}
            disabled={loading || !isAuthenticated}
            className={cn(
              'rounded-md px-3 py-2 text-sm font-medium transition-colors',
              'bg-orange-100 text-orange-700 hover:bg-orange-200',
              'disabled:opacity-50 disabled:cursor-not-allowed',
            )}
          >
            🔄 Intercambio
          </button>

          <button
            onClick={() => handleAwardPoints('receive_positive_review')}
            disabled={loading || !isAuthenticated}
            className={cn(
              'rounded-md px-3 py-2 text-sm font-medium transition-colors',
              'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
              'disabled:opacity-50 disabled:cursor-not-allowed',
            )}
          >
            ⭐ Reseña
          </button>

          <button
            onClick={() => handleDeductPoints(10)}
            disabled={loading || !isAuthenticated}
            className={cn(
              'rounded-md px-3 py-2 text-sm font-medium transition-colors',
              'bg-red-100 text-red-700 hover:bg-red-200',
              'disabled:opacity-50 disabled:cursor-not-allowed',
            )}
          >
            ➖ -10 pts
          </button>
        </div>

        {message && (
          <div
            className={cn(
              'rounded-md p-3 text-sm font-medium',
              message.type === 'success'
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700',
            )}
          >
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
}
