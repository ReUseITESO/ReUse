import { getStoredTokens, refreshAndStore, clearTokens } from '@/lib/auth';
import type { ProductReactionSummary, ProductReactionType } from '@/types/product';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';

export async function apiClient<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const tokens = getStoredTokens();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };

  if (tokens?.access) {
    headers['Authorization'] = `Bearer ${tokens.access}`;
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor.');
  }

  if (response.status === 401 && tokens?.refresh) {
    const refreshed = await refreshAndStore(tokens.refresh);
    if (refreshed) {
      headers['Authorization'] = `Bearer ${refreshed.access}`;
      try {
        response = await fetch(`${API_BASE}${endpoint}`, {
          ...options,
          headers,
        });
      } catch {
        throw new Error('No se pudo conectar con el servidor.');
      }
    } else {
      clearTokens();
      throw new Error('La sesión ha expirado. Inicia sesión de nuevo.');
    }
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = body?.error?.message ?? `Error ${response.status}`;
    throw new Error(message);
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

// ===== Marketplace Products =====

export async function getProductById(id: string | number) {
  return apiClient(`/marketplace/products/${id}/`);
}

export async function postProductReaction(
  id: string | number,
  type: ProductReactionType,
): Promise<ProductReactionSummary> {
  return apiClient<ProductReactionSummary>(`/marketplace/products/${id}/reactions/`, {
    method: 'POST',
    body: JSON.stringify({ type }),
  });
}

export async function deleteProductReaction(id: string | number): Promise<ProductReactionSummary> {
  return apiClient<ProductReactionSummary>(`/marketplace/products/${id}/reactions/`, {
    method: 'DELETE',
  });
}
