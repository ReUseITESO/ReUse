'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { getMockUserId, setMockUserId } from '@/lib/api';

export interface MockUser {
  id: number;
  name: string;
  email: string;
}

const MOCK_USER_IDS = {
  MARIA_GARCIA: 2,
  JUAN_LOPEZ: 3,
  ANA_MARTINEZ: 4,
  CARLOS_RODRIGUEZ: 5,
  LUCIA_FERNANDEZ: 6,
} as const;

const MOCK_USERS: MockUser[] = [
  { id: MOCK_USER_IDS.MARIA_GARCIA, name: 'María García Pérez', email: 'maria.garcia@iteso.mx' },
  { id: MOCK_USER_IDS.JUAN_LOPEZ, name: 'Juan López Sánchez', email: 'juan.lopez@iteso.mx' },
  { id: MOCK_USER_IDS.ANA_MARTINEZ, name: 'Ana Martínez Ruiz', email: 'ana.martinez@iteso.mx' },
  { id: MOCK_USER_IDS.CARLOS_RODRIGUEZ, name: 'Carlos Rodríguez Torres', email: 'carlos.rodriguez@iteso.mx' },
  { id: MOCK_USER_IDS.LUCIA_FERNANDEZ, name: 'Lucía Fernández Gómez', email: 'lucia.fernandez@iteso.mx' },
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
      const user = MOCK_USERS.find((u) => u.id === Number(storedId));
      if (user) setCurrentUser(user);
    }
  }, []);

  const login = useCallback((userId: number) => {
    const user = MOCK_USERS.find((u) => u.id === userId);
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
