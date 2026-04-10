import type { AuthResponse, SignInRequest, SignUpRequest, User, AuthTokens } from '@/types/auth';

type SignUpResponse = Record<string, unknown>;
type SignUpErrorResponse = {
  error?: {
    message?: string;
    details?: Record<string, string[]>;
  };
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';

/**
 * HU-CORE-17: Error con código de API para distinguir tipos de fallo.
 * Extiende Error para mantener compatibilidad con código existente.
 */
export class ApiError extends Error {
  code: string;
  constructor(message: string, code: string) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
  }
}

const ACCESS_KEY = 'reuse_access_token';
const REFRESH_KEY = 'reuse_refresh_token';

export function getStoredTokens(): AuthTokens | null {
  if (typeof window === 'undefined') return null;
  const access = localStorage.getItem(ACCESS_KEY);
  const refresh = localStorage.getItem(REFRESH_KEY);
  if (!access || !refresh) return null;
  return { access, refresh };
}

export function storeTokens(tokens: AuthTokens): void {
  localStorage.setItem(ACCESS_KEY, tokens.access);
  localStorage.setItem(REFRESH_KEY, tokens.refresh);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

async function authFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const tokens = getStoredTokens();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  if (tokens?.access) {
    headers['Authorization'] = `Bearer ${tokens.access}`;
  }

  let response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && tokens?.refresh) {
    const refreshed = await refreshAndStore(tokens.refresh);
    if (refreshed) {
      headers['Authorization'] = `Bearer ${refreshed.access}`;
      response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });
    } else {
      clearTokens();
      throw new Error('La sesión ha expirado. Inicia sesión de nuevo.');
    }
  }

  if (response.status === 429) {
    const body = await response.json().catch(() => null);
    throw new Error(
      body?.error?.message ??
        'Demasiadas solicitudes. Espera un momento antes de intentar de nuevo.',
    );
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = body?.error?.message ?? body?.message ?? `Error ${response.status}`;
    throw new Error(message);
  }

  return response.json();
}

export async function refreshAndStore(refreshToken: string): Promise<AuthTokens | null> {
  try {
    const response = await fetch(`${API_BASE}/auth/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const tokens: AuthTokens = {
      access: data.access,
      refresh: data.refresh ?? refreshToken,
    };
    storeTokens(tokens);
    return tokens;
  } catch {
    return null;
  }
}

export async function signIn(credentials: SignInRequest): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE}/auth/signin/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  if (response.status === 429) {
    const body = await response.json().catch(() => null);
    throw new Error(
      body?.error?.message ??
        'Demasiadas solicitudes. Espera un momento antes de intentar de nuevo.',
    );
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const code: string = body?.error?.code ?? 'UNKNOWN';
    const message: string = body?.error?.message ?? 'Correo o contraseña incorrectos.';
    // Lanzar ApiError para que el llamador pueda distinguir por código
    throw new ApiError(message, code);
  }

  const data: AuthResponse = await response.json();
  storeTokens(data.tokens);
  return data;
}

export async function deactivateAccount(): Promise<void> {
  const tokens = getStoredTokens();
  await authFetch('/auth/account/deactivate/', {
    method: 'POST',
    body: JSON.stringify({ refresh: tokens?.refresh ?? null }),
  });
  clearTokens();
}

export async function requestReactivationEmail(email: string): Promise<void> {
  const response = await fetch(`${API_BASE}/auth/account/reactivate/send/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error?.message ?? 'Error al enviar el correo de reactivación.');
  }
}

export async function confirmReactivation(token: string): Promise<{ message: string; email: string }> {
  const response = await fetch(
    `${API_BASE}/auth/account/reactivate/confirm/?token=${encodeURIComponent(token)}`,
    { method: 'GET', headers: { Accept: 'application/json' } },
  );
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const code: string = body?.error?.code ?? 'UNKNOWN';
    const message: string = body?.error?.message ?? 'No se pudo reactivar la cuenta.';
    throw new ApiError(message, code);
  }
  return body;
}

export async function signUp(payload: SignUpRequest): Promise<SignUpResponse> {
  const response = await fetch(`${API_BASE}/auth/signup/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  });

  const body = (await response.json().catch(() => ({}))) as SignUpResponse & SignUpErrorResponse;

  if (response.status === 429) {
    throw new Error(
      body?.error?.message ??
        'Demasiadas solicitudes. Espera un momento antes de intentar de nuevo.',
    );
  }

  if (!response.ok) {
    if (body?.error?.details) {
      const details = body.error.details;
      const messages = Object.values(details).flat();
      throw new Error((messages as string[]).join(' '));
    }
    throw new Error(body?.error?.message ?? 'Error al crear la cuenta.');
  }

  return body as Record<string, unknown>;
}

export async function signOut(): Promise<void> {
  const tokens = getStoredTokens();
  if (tokens?.refresh) {
    try {
      await authFetch('/auth/signout/', {
        method: 'POST',
        body: JSON.stringify({ refresh: tokens.refresh }),
      });
    } catch {}
  }
  clearTokens();
}

export async function getProfile(): Promise<User> {
  return authFetch<User>('/auth/profile/');
}

export async function getMicrosoftAuthUrl(): Promise<string> {
  const response = await fetch(`${API_BASE}/auth/microsoft/`);
  if (!response.ok) {
    throw new Error('No se pudo iniciar el flujo de autenticación con Microsoft.');
  }
  const data = await response.json();
  return data.auth_url;
}

export async function microsoftSignIn(code: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE}/auth/microsoft/callback/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error?.message ?? 'Error al autenticar con Microsoft.');
  }

  const data: AuthResponse = await response.json();
  storeTokens(data.tokens);
  return data;
}

export { authFetch };
