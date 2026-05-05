import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChallengesBoard from '@/components/gamification/ChallengesBoard';
import { useAuth } from '@/hooks/useAuth';
import { useChallenges } from '@/hooks/useChallenges';
import type { Challenge, UserChallenge } from '@/types/gamification';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/hooks/useChallenges', () => ({
  useChallenges: vi.fn(),
}));

const mockedUseAuth = vi.mocked(useAuth);
const mockedUseChallenges = vi.mocked(useChallenges);

const DAILY = { start_date: '2026-05-01T00:00:00Z', end_date: '2026-05-02T00:00:00Z' };
const WEEKLY = { start_date: '2026-05-01T00:00:00Z', end_date: '2026-05-08T00:00:00Z' };
const MONTHLY = { start_date: '2026-05-01T00:00:00Z', end_date: '2026-06-05T00:00:00Z' };

function buildChallenge(partial: Partial<Challenge> = {}): Challenge {
  return {
    id: 1,
    title: 'Reto de prueba',
    description: 'Descripcion del reto',
    challenge_type: 'publish',
    goal: 3,
    bonus_points: 30,
    joined: true,
    ...DAILY,
    ...partial,
  };
}

function buildUserChallenge(partial: Partial<UserChallenge> = {}): UserChallenge {
  return {
    id: 10,
    challenge_id: 1,
    title: 'Reto de prueba',
    description: 'Descripcion del reto',
    challenge_type: 'publish',
    goal: 3,
    progress: 0,
    bonus_points: 30,
    is_completed: false,
    reward_claimed: false,
    reward_claimed_at: null,
    joined_at: '2026-05-01T00:00:00Z',
    completed_at: null,
    is_expired: false,
    ...DAILY,
    ...partial,
  };
}

const authUser = {
  user: { id: 1 } as never,
  isLoading: false,
  isAuthenticated: true,
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  signInWithMicrosoft: vi.fn(),
  updateUser: vi.fn(),
};

const emptyChallenges = {
  challenges: [],
  myChallenges: [],
  isLoading: false,
  error: null,
  claimChallengeReward: vi.fn(),
  refetch: vi.fn(),
};

describe('ChallengesBoard – HU-GAM-05: Participar en retos de sostenibilidad', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseAuth.mockReturnValue(authUser);
    mockedUseChallenges.mockReturnValue(emptyChallenges);
  });

  // ── Estructura de pestañas ────────────────────────────────────────────────

  it('muestra tres pestañas: Diarios, Semanales, Mensuales', () => {
    render(React.createElement(ChallengesBoard));
    expect(screen.getByRole('button', { name: 'Diarios' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Semanales' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Mensuales' })).toBeInTheDocument();
  });

  it('la pestaña Diarios es la activa por defecto y muestra retos de 1-2 días', () => {
    mockedUseChallenges.mockReturnValue({
      ...emptyChallenges,
      challenges: [
        buildChallenge({ id: 1, title: 'Reto diario', ...DAILY }),
        buildChallenge({ id: 2, title: 'Reto semanal', ...WEEKLY }),
      ],
    });

    render(React.createElement(ChallengesBoard));

    expect(screen.getByText('Reto diario')).toBeInTheDocument();
    expect(screen.queryByText('Reto semanal')).not.toBeInTheDocument();
  });

  it('al cambiar a Semanales solo muestra retos de 3-10 días', () => {
    mockedUseChallenges.mockReturnValue({
      ...emptyChallenges,
      challenges: [
        buildChallenge({ id: 1, title: 'Reto diario', ...DAILY }),
        buildChallenge({ id: 2, title: 'Reto semanal', ...WEEKLY }),
      ],
    });

    render(React.createElement(ChallengesBoard));
    fireEvent.click(screen.getByRole('button', { name: 'Semanales' }));

    expect(screen.queryByText('Reto diario')).not.toBeInTheDocument();
    expect(screen.getByText('Reto semanal')).toBeInTheDocument();
  });

  it('al cambiar a Mensuales muestra retos de más de 10 días', () => {
    mockedUseChallenges.mockReturnValue({
      ...emptyChallenges,
      challenges: [buildChallenge({ id: 3, title: 'Reto mensual', ...MONTHLY })],
    });

    render(React.createElement(ChallengesBoard));
    fireEvent.click(screen.getByRole('button', { name: 'Mensuales' }));

    expect(screen.getByText('Reto mensual')).toBeInTheDocument();
  });

  it('cambiar a pestaña sin retos muestra estado vacío', () => {
    mockedUseChallenges.mockReturnValue({
      ...emptyChallenges,
      challenges: [buildChallenge({ id: 1, title: 'Solo diario', ...DAILY })],
    });

    render(React.createElement(ChallengesBoard));
    fireEvent.click(screen.getByRole('button', { name: 'Semanales' }));

    expect(screen.getByText('No hay retos activos en esta categoría')).toBeInTheDocument();
  });

  // ── Visualización del reto ────────────────────────────────────────────────

  it('muestra el título del reto y sus puntos bonus', () => {
    mockedUseChallenges.mockReturnValue({
      ...emptyChallenges,
      challenges: [buildChallenge({ title: 'Dona 3 artículos', bonus_points: 50 })],
    });

    render(React.createElement(ChallengesBoard));

    expect(screen.getByText('Dona 3 artículos')).toBeInTheDocument();
    expect(screen.getByText('+50 pts')).toBeInTheDocument();
  });

  it('muestra el progreso X / Y para un reto en curso', () => {
    mockedUseChallenges.mockReturnValue({
      ...emptyChallenges,
      challenges: [buildChallenge({ id: 1, goal: 5 })],
      myChallenges: [buildUserChallenge({ challenge_id: 1, progress: 2, goal: 5 })],
    });

    render(React.createElement(ChallengesBoard));

    expect(screen.getByText(/2\s*\/\s*5/)).toBeInTheDocument();
  });

  it('capea el progreso al goal cuando el servidor envía valor mayor', () => {
    mockedUseChallenges.mockReturnValue({
      ...emptyChallenges,
      challenges: [buildChallenge({ id: 1, goal: 3 })],
      myChallenges: [buildUserChallenge({ challenge_id: 1, progress: 999, goal: 3 })],
    });

    render(React.createElement(ChallengesBoard));

    expect(screen.getByText(/3\s*\/\s*3/)).toBeInTheDocument();
  });

  it('muestra 0 / goal para reto sin UserChallenge asociado', () => {
    mockedUseChallenges.mockReturnValue({
      ...emptyChallenges,
      challenges: [buildChallenge({ id: 1, goal: 5 })],
      myChallenges: [],
    });

    render(React.createElement(ChallengesBoard));

    expect(screen.getByText(/0\s*\/\s*5/)).toBeInTheDocument();
  });

  it('renderiza múltiples retos en la misma pestaña', () => {
    mockedUseChallenges.mockReturnValue({
      ...emptyChallenges,
      challenges: [
        buildChallenge({ id: 1, title: 'Reto A', ...DAILY }),
        buildChallenge({ id: 2, title: 'Reto B', ...DAILY }),
        buildChallenge({ id: 3, title: 'Reto C', ...DAILY }),
      ],
    });

    render(React.createElement(ChallengesBoard));

    expect(screen.getByText('Reto A')).toBeInTheDocument();
    expect(screen.getByText('Reto B')).toBeInTheDocument();
    expect(screen.getByText('Reto C')).toBeInTheDocument();
  });

  // ── Etiquetas de estado ───────────────────────────────────────────────────

  it('muestra "En curso" para reto activo sin completar', () => {
    mockedUseChallenges.mockReturnValue({
      ...emptyChallenges,
      challenges: [buildChallenge({ id: 1 })],
      myChallenges: [buildUserChallenge({ challenge_id: 1, progress: 1, is_completed: false })],
    });

    render(React.createElement(ChallengesBoard));

    expect(screen.getByText('En curso')).toBeInTheDocument();
  });

  it('muestra botón "Reclamar" para reto completado y sin reclamar', () => {
    mockedUseChallenges.mockReturnValue({
      ...emptyChallenges,
      challenges: [buildChallenge({ id: 1 })],
      myChallenges: [
        buildUserChallenge({ challenge_id: 1, progress: 3, is_completed: true, reward_claimed: false }),
      ],
    });

    render(React.createElement(ChallengesBoard));

    expect(screen.getByRole('button', { name: 'Reclamar' })).toBeInTheDocument();
  });

  it('el botón "Reclamar" no aparece cuando la recompensa ya fue reclamada', () => {
    mockedUseChallenges.mockReturnValue({
      ...emptyChallenges,
      challenges: [buildChallenge({ id: 1 })],
      myChallenges: [
        buildUserChallenge({ challenge_id: 1, progress: 3, is_completed: true, reward_claimed: true }),
      ],
    });

    render(React.createElement(ChallengesBoard));

    expect(screen.queryByRole('button', { name: 'Reclamar' })).not.toBeInTheDocument();
    expect(screen.getByText('Reclamado')).toBeInTheDocument();
  });

  // ── Flujo de reclamación de recompensa ────────────────────────────────────

  it('llama a claimChallengeReward con el id correcto al hacer clic en Reclamar', async () => {
    const claimMock = vi.fn().mockResolvedValue(undefined);
    mockedUseChallenges.mockReturnValue({
      ...emptyChallenges,
      challenges: [buildChallenge({ id: 42 })],
      myChallenges: [
        buildUserChallenge({ challenge_id: 42, progress: 3, is_completed: true, reward_claimed: false }),
      ],
      claimChallengeReward: claimMock,
    });

    render(React.createElement(ChallengesBoard));
    fireEvent.click(screen.getByRole('button', { name: 'Reclamar' }));

    await waitFor(() => {
      expect(claimMock).toHaveBeenCalledTimes(1);
      expect(claimMock).toHaveBeenCalledWith(42);
    });
  });

  it('muestra "Recompensa reclamada." tras una reclamación exitosa', async () => {
    const claimMock = vi.fn().mockResolvedValue(undefined);
    mockedUseChallenges.mockReturnValue({
      ...emptyChallenges,
      challenges: [buildChallenge({ id: 1 })],
      myChallenges: [
        buildUserChallenge({ challenge_id: 1, progress: 3, is_completed: true, reward_claimed: false }),
      ],
      claimChallengeReward: claimMock,
    });

    render(React.createElement(ChallengesBoard));
    fireEvent.click(screen.getByRole('button', { name: 'Reclamar' }));

    await waitFor(() => {
      expect(screen.getByText('Recompensa reclamada.')).toBeInTheDocument();
    });
  });

  it('muestra mensaje de error cuando falla la reclamación', async () => {
    const claimMock = vi.fn().mockRejectedValue(new Error('No se pudo reclamar la recompensa.'));
    mockedUseChallenges.mockReturnValue({
      ...emptyChallenges,
      challenges: [buildChallenge({ id: 1 })],
      myChallenges: [
        buildUserChallenge({ challenge_id: 1, progress: 3, is_completed: true, reward_claimed: false }),
      ],
      claimChallengeReward: claimMock,
    });

    render(React.createElement(ChallengesBoard));
    fireEvent.click(screen.getByRole('button', { name: 'Reclamar' }));

    await waitFor(() => {
      expect(screen.getByText('No se pudo reclamar la recompensa.')).toBeInTheDocument();
    });
  });

  it('no llama a claimChallengeReward si el reto ya fue reclamado', () => {
    const claimMock = vi.fn();
    mockedUseChallenges.mockReturnValue({
      ...emptyChallenges,
      challenges: [buildChallenge({ id: 1 })],
      myChallenges: [
        buildUserChallenge({ challenge_id: 1, progress: 3, is_completed: true, reward_claimed: true }),
      ],
      claimChallengeReward: claimMock,
    });

    render(React.createElement(ChallengesBoard));

    expect(claimMock).not.toHaveBeenCalled();
  });

  // ── Estado de error de API ────────────────────────────────────────────────

  it('muestra el mensaje de error cuando useChallenges retorna error', () => {
    mockedUseChallenges.mockReturnValue({
      ...emptyChallenges,
      error: 'No se pudieron cargar los retos',
    });

    render(React.createElement(ChallengesBoard));

    expect(screen.getByText('No se pudieron cargar los retos')).toBeInTheDocument();
  });

  // ── Tipos de reto y temas visuales ───────────────────────────────────────

  it('renderiza reto de tipo "donation" sin errores', () => {
    mockedUseChallenges.mockReturnValue({
      ...emptyChallenges,
      challenges: [buildChallenge({ challenge_type: 'donation', title: 'Reto donación' })],
    });
    expect(() => render(React.createElement(ChallengesBoard))).not.toThrow();
    expect(screen.getByText('Reto donación')).toBeInTheDocument();
  });

  it('renderiza reto de tipo "exchange" sin errores', () => {
    mockedUseChallenges.mockReturnValue({
      ...emptyChallenges,
      challenges: [buildChallenge({ challenge_type: 'exchange', title: 'Reto intercambio' })],
    });
    expect(() => render(React.createElement(ChallengesBoard))).not.toThrow();
    expect(screen.getByText('Reto intercambio')).toBeInTheDocument();
  });

  it('renderiza reto de tipo "sale" sin errores', () => {
    mockedUseChallenges.mockReturnValue({
      ...emptyChallenges,
      challenges: [buildChallenge({ challenge_type: 'sale', title: 'Reto venta' })],
    });
    expect(() => render(React.createElement(ChallengesBoard))).not.toThrow();
    expect(screen.getByText('Reto venta')).toBeInTheDocument();
  });

  it('renderiza reto de tipo "review" sin errores', () => {
    mockedUseChallenges.mockReturnValue({
      ...emptyChallenges,
      challenges: [buildChallenge({ challenge_type: 'review', title: 'Reto reseña' })],
    });
    expect(() => render(React.createElement(ChallengesBoard))).not.toThrow();
    expect(screen.getByText('Reto reseña')).toBeInTheDocument();
  });
});
