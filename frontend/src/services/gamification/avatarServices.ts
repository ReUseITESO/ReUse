// src/services/gamification/avatarService.ts

import { AvatarData } from '@/types/gamification';

const BASE_URL = 'http://localhost:8000/api/gamification/avatar/';

export const avatarService = {
  // The function returns a Promise of the data
  get: async () => {
    const response = await fetch(BASE_URL, { credentials: 'include' });
    if (!response.ok) throw new Error('Failed to fetch avatar');
    return response.json();
  },

  update: async (data: AvatarData) => {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update avatar');
    return response.json();
  },
};
