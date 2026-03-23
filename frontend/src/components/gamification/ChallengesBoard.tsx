'use client';

import { useMemo, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { useChallenges } from '@/hooks/useChallenges';
import type { UserChallenge } from '@/types/gamification';

function getProgressForChallenge(challengeId: number, myChallenges: UserChallenge[]) {
  return myChallenges.find(item => item.challenge_id === challengeId);
}

function getChallengeLabel(type: 'donation' | 'exchange' | 'sale' | 'publish' | 'review') {
  if (type === 'donation') {
    return 'Donaciones';
  }
  if (type === 'exchange') {
    return 'Intercambios';
  }
  if (type === 'sale') {
    return 'Ventas';
  }
  if (type === 'publish') {
    return 'Publicaciones';
  }
  return 'Reseñas positivas';
}

interface ChallengesBoardProps {
  refreshTrigger?: number;
}

export default function ChallengesBoard({ refreshTrigger = 0 }: ChallengesBoardProps) {
  const { isAuthenticated } = useAuth();
  const { challenges, myChallenges, isLoading, error, joinChallenge, refetch } = useChallenges(
    isAuthenticated,
    refreshTrigger,
  );
  const [message, setMessage] = useState<string | null>(null);
  const [isErrorMessage, setIsErrorMessage] = useState(false);
  const [joiningId, setJoiningId] = useState<number | null>(null);

  const completedChallenges = useMemo(
    () => myChallenges.filter(challenge => challenge.is_completed).length,
    [myChallenges],
  );

  const handleJoinChallenge = async (challengeId: number) => {
    setJoiningId(challengeId);
    setMessage(null);
    setIsErrorMessage(false);

    try {
      await joinChallenge(challengeId);
      setMessage('Te uniste al reto correctamente.');
    } catch (err) {
      setIsErrorMessage(true);
      setMessage(err instanceof Error ? err.message : 'No se pudo unir al reto');
    } finally {
      setJoiningId(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <section className="rounded-lg border border-yellow-300 bg-yellow-50 p-4">
        <h3 className="text-base font-semibold text-yellow-900">Retos de sostenibilidad</h3>
        <p className="mt-1 text-sm text-yellow-800">
          Inicia sesion para ver y participar en retos activos.
        </p>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <h3 className="text-base font-semibold text-slate-900">Retos de sostenibilidad</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="h-32 animate-pulse rounded-md bg-slate-100" />
          <div className="h-32 animate-pulse rounded-md bg-slate-100" />
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Retos de sostenibilidad</h3>
          <p className="text-sm text-slate-600">
            Completados: {completedChallenges} de {myChallenges.length}
          </p>
        </div>
        <button
          type="button"
          onClick={refetch}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Actualizar progreso
        </button>
      </div>

      {message ? (
        <p className={`mt-3 text-sm ${isErrorMessage ? 'text-red-600' : 'text-emerald-700'}`}>
          {message}
        </p>
      ) : null}

      {error ? (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      ) : null}

      {challenges.length === 0 ? (
        <p className="mt-4 text-sm text-slate-600">No hay retos activos por el momento.</p>
      ) : (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {challenges.map(challenge => {
            const progress = getProgressForChallenge(challenge.id, myChallenges);
            const currentValue = progress ? progress.progress : 0;
            const normalizedProgress = Math.min(
              100,
              Math.round((currentValue / challenge.goal) * 100),
            );
            const isJoined = challenge.joined;
            const isCompleted = progress?.is_completed ?? false;

            return (
              <article key={challenge.id} className="rounded-md border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">{challenge.title}</h4>
                    <p className="mt-1 text-sm text-slate-600">{challenge.description}</p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800">
                    +{challenge.bonus_points} pts
                  </span>
                </div>

                <div className="mt-3 text-xs text-slate-600">
                  <p>Tipo: {getChallengeLabel(challenge.challenge_type)}</p>
                  <p>
                    Meta: {challenge.goal}{' '}
                    {getChallengeLabel(challenge.challenge_type).toLowerCase()}
                  </p>
                </div>

                {isJoined ? (
                  <div className="mt-3 space-y-2">
                    <div className="h-2 rounded-full bg-slate-200">
                      <div
                        className="h-2 rounded-full bg-emerald-500"
                        style={{ width: `${normalizedProgress}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-700">
                      Progreso: {Math.min(currentValue, challenge.goal)}/{challenge.goal}
                    </p>
                    {isCompleted ? (
                      <p className="text-xs font-medium text-emerald-700">
                        Reto completado. Bonus acreditado.
                      </p>
                    ) : null}
                  </div>
                ) : null}

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => handleJoinChallenge(challenge.id)}
                    disabled={isJoined || joiningId === challenge.id}
                    className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isJoined
                      ? 'Ya participas en este reto'
                      : joiningId === challenge.id
                        ? 'Uniendote...'
                        : 'Unirme al reto'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
