const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';

const MOCK_USER_STORAGE_KEY = 'mock_user_id';

export function getMockUserId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(MOCK_USER_STORAGE_KEY);
}

export function setMockUserId(userId: string | null): void {
  if (typeof window === 'undefined') return;
  if (userId) {
    localStorage.setItem(MOCK_USER_STORAGE_KEY, userId);
  } else {
    localStorage.removeItem(MOCK_USER_STORAGE_KEY);
  }
}

export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const mockUserId = getMockUserId();
  const authHeaders: Record<string, string> = {};
  if (mockUserId) {
    authHeaders['X-Mock-User-Id'] = mockUserId;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message =
      body?.error?.message ?? `Error ${response.status}`;
    throw new Error(message);
  }

  return response.json();
}