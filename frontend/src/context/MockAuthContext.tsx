'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { getMockUserId, setMockUserId } from '@/lib/api';

export interface MockUser {
  id: number;
  name: string;
  email: string;
}

const MOCK_USER_IDS = {
  ANA_GARCIA: 1,
  CARLOS_LOPEZ: 2,
  MARIA_TORRES: 3,
} as const;

const MOCK_USERS: MockUser[] = [
  { id: MOCK_USER_IDS.ANA_GARCIA, name: 'Ana García', email: 'ana.garcia@iteso.mx' },
  { id: MOCK_USER_IDS.CARLOS_LOPEZ, name: 'Carlos López', email: 'carlos.lopez@iteso.mx' },
  { id: MOCK_USER_IDS.MARIA_TORRES, name: 'María Torres', email: 'maria.torres@iteso.mx' },
];

interface MockAuthContextValue {
  currentUser: MockUser | null;
  availableUsers: MockUser[];
  isAuthenticated: boolean;
  login: (userId: number) => void;
  logout: () => void;
}

const MockAuthContext = createContext<MockAuthContextValue | null>(null);

export function MockAuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<MockUser | null>(null);

  useEffect(() => {
    const storedId = getMockUserId();
    if (storedId) {
      const user = MOCK_USERS.find(u => u.id === Number(storedId));
      if (user) setCurrentUser(user);
    }
  }, []);

  const login = useCallback((userId: number) => {
    const user = MOCK_USERS.find(u => u.id === userId);
    if (user) {
      setMockUserId(String(user.id));
      setCurrentUser(user);
    }
  }, []);

  const logout = useCallback(() => {
    setMockUserId(null);
    setCurrentUser(null);
  }, []);

  return (
    <MockAuthContext.Provider
      value={{
        currentUser,
        availableUsers: MOCK_USERS,
        isAuthenticated: currentUser !== null,
        login,
        logout,
      }}
    >
      {children}
    </MockAuthContext.Provider>
  );
}

export function useMockAuth() {
  const context = useContext(MockAuthContext);
  if (!context) {
    throw new Error('useMockAuth must be used within MockAuthProvider');
  }
  return context;
}
