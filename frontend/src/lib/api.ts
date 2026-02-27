// TODO: uncomment when auth module is implemented
// import { getAccessToken } from '@/lib/auth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';

export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  // TODO: uncomment when JWT auth is wired in
  // const token = getAccessToken();

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      // TODO: uncomment when JWT auth is wired in
      // ...(token && { Authorization: `Bearer ${token}` }),
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