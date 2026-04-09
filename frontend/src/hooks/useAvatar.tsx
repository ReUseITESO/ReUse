// src/hooks/useAvatar.ts
import { useState, useCallback, useEffect, createContext, useMemo, useContext } from 'react';
import { apiClient } from '@/lib/api';
import { AvatarData } from '@/types/gamification';

const defaultAvatarData = {
  image: null,
  border_thickness: 10,
  border_color: "#000A9A",
  shadow_color: "#4e0072",
  shadow_thickness: 20,
  zoom_level: 1,
  offset_x: 50,
  offset_y: 50,
};

interface AvatarContextValue {
  avatarData: AvatarData;
  setAvatarData: React.Dispatch<React.SetStateAction<AvatarData>>;
  isLoading: boolean;
  error: string | null;
  updateAvatar: (newData: AvatarData) => Promise<{ success: boolean; error?: undefined } | { success: boolean; error: unknown }>;
}

const AvatarContext = createContext<AvatarContextValue | undefined>(undefined);

export function AvatarProvider({ children } : { children: React.ReactNode }) {
  const [avatarData, setAvatarData] = useState<AvatarData>(defaultAvatarData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAvatar = useCallback(async () => {
    setIsLoading(true);
    try {
      // apiClient handles http://localhost:8000 and credentials/CSRF
      const data = await apiClient<Partial<AvatarData>>('/gamification/avatar/');

      setAvatarData({...defaultAvatarData, ...data}); // Merge with defaults
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading avatar');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateAvatar = useCallback(async (newData: AvatarData) => {
    try {
      await apiClient('/gamification/avatar/', {
        method: 'POST',
        body: JSON.stringify(newData),
      });
      setAvatarData(newData);
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  }, []);

  useEffect(() => {
    fetchAvatar();
  }, [fetchAvatar]);

  const value = useMemo<AvatarContextValue>(
    () => ({
      avatarData,
      setAvatarData,
      isLoading,
      error,
      updateAvatar,
    }),
    [avatarData, isLoading, error, updateAvatar],
  );
  
  return (
    <AvatarContext.Provider value={value}>
      {children}
    </AvatarContext.Provider>
  );
}

export function useAvatar(): AvatarContextValue {
  const context = useContext(AvatarContext);
  if (!context) {
    throw new Error('useAvatar must be used inside AvatarProvider');
  }
  return context;
}
