import { getStoredTokens } from '@/lib/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';

export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const tokens = getStoredTokens();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  if (tokens?.access) {
    headers['Authorization'] = `Bearer ${tokens.access}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message =
      body?.error?.message ?? `Error ${response.status}`;
    throw new Error(message);
  }

  return response.json();
}