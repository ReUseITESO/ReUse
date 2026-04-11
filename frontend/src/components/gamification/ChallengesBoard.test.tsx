import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
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

function buildChallenge(partial: Partial<Challenge> = {}): Challenge {
  return {
    id: 1,
    title: 'Reto de prueba',
    description: 'Descripcion',
    challenge_type: 'publish',
    goal: 2,
    bonus_points: 20,
    start_date: '2026-04-10T00:00:00Z',
    end_date: '2026-04-11T00:00:00Z',
    joined: true,
    ...partial,
  };
}

function buildUserChallenge(partial: Partial<UserChallenge> = {}): UserChallenge {
  return {
    id: 10,
    challenge_id: 1,
    title: 'Reto de prueba',
    description: 'Descripcion',
    challenge_type: 'publish',
    goal: 2,
    progress: 0,
    bonus_points: 20,
    is_completed: false,
    reward_claimed: false,
    reward_claimed_at: null,
    joined_at: '2026-04-10T00:00:00Z',
    completed_at: null,
    start_date: '2026-04-10T00:00:00Z',
    end_date: '2026-04-11T00:00:00Z',
    is_expired: false,
    ...partial,
  };
}

describe('ChallengesBoard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseChallenges.mockReturnValue({
      challenges: [],
      myChallenges: [],
      isLoading: false,
      error: null,
      claimChallengeReward: vi.fn(),
      refetch: vi.fn(),
    });
  });

  it('shows auth warning when user is not authenticated', () => {
    mockedUseAuth.mockReturnValue({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      signInWithMicrosoft: vi.fn(),
    });

    render(React.createElement(ChallengesBoard));

    expect(screen.getByText('Retos')).toBeInTheDocument();
    expect(
      screen.getByText('Inicia sesión para ver y participar en retos activos.'),
    ).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockedUseAuth.mockReturnValue({
      user: { id: 1 } as never,
      isLoading: false,
      isAuthenticated: true,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      signInWithMicrosoft: vi.fn(),
    });
    mockedUseChallenges.mockReturnValue({
      challenges: [],
      myChallenges: [],
      isLoading: true,
      error: null,
      claimChallengeReward: vi.fn(),
      refetch: vi.fn(),
    });

    render(React.createElement(ChallengesBoard));

    expect(screen.getByText('Retos')).toBeInTheDocument();
  });

  it('shows empty state when there are no active challenges', () => {
    mockedUseAuth.mockReturnValue({
      user: { id: 1 } as never,
      isLoading: false,
      isAuthenticated: true,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      signInWithMicrosoft: vi.fn(),
    });

    render(React.createElement(ChallengesBoard));

    expect(screen.getByText('No hay retos activos en esta categoría')).toBeInTheDocument();
  });

  it('shows claimed state when reward is already claimed', () => {
    mockedUseAuth.mockReturnValue({
      user: { id: 1 } as never,
      isLoading: false,
      isAuthenticated: true,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      signInWithMicrosoft: vi.fn(),
    });

    const claimMock = vi.fn();
    mockedUseChallenges.mockReturnValue({
      challenges: [buildChallenge()],
      myChallenges: [buildUserChallenge({ progress: 2, is_completed: true, reward_claimed: true })],
      isLoading: false,
      error: null,
      claimChallengeReward: claimMock,
      refetch: vi.fn(),
    });

    render(React.createElement(ChallengesBoard));

    expect(screen.getByRole('button', { name: '✓ Reclamado' })).toBeDisabled();
    expect(claimMock).not.toHaveBeenCalled();
  });
});
