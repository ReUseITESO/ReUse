'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { User } from '@/types/auth';
import type { SignInRequest, SignUpRequest } from '@/types/auth';
import {
  signIn as apiSignIn,
  signUp as apiSignUp,
  signOut as apiSignOut,
  microsoftSignIn as apiMicrosoftSignIn,
  getProfile,
  getStoredTokens,
  clearTokens,
} from '@/lib/auth';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (credentials: SignInRequest) => Promise<void>;
  signUp: (payload: SignUpRequest) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithMicrosoft: (code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const tokens = getStoredTokens();
    if (!tokens) {
      setIsLoading(false);
      return;
    }

    getProfile()
      .then(setUser)
      .catch(() => {
        clearTokens();
      })
      .finally(() => setIsLoading(false));
  }, []);

  const signIn = useCallback(async (credentials: SignInRequest) => {
    const data = await apiSignIn(credentials);
    setUser(data.user);
  }, []);

  const signUp = useCallback(async (payload: SignUpRequest) => {
    await apiSignUp(payload);
  }, []);

  const signOut = useCallback(async () => {
    await apiSignOut();
    setUser(null);
  }, []);

  const signInWithMicrosoft = useCallback(async (code: string) => {
    const data = await apiMicrosoftSignIn(code);
    setUser(data.user);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      signIn,
      signUp,
      signOut,
      signInWithMicrosoft,
    }),
    [user, isLoading, signIn, signUp, signOut, signInWithMicrosoft],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
