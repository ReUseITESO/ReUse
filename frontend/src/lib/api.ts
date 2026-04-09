import { getStoredTokens, refreshAndStore, clearTokens } from '@/lib/auth';

import type { PaginatedResponse } from '@/types/api';
import type {
  CreateTransactionPayload,
  SwapMeetingProposalPayload,
  SwapMeetingResponsePayload,
  SwapProposalPayload,
  Transaction,
  UpdateTransactionStatusPayload,
} from '@/types/transaction';

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

interface GetProductByIdOptions {
  mine?: boolean;
}

export async function getProductById(id: string | number, options: GetProductByIdOptions = {}) {
  const query = options.mine ? '?seller=me' : '';
  return apiClient(`/marketplace/products/${id}/${query}`);
}

// ===== Marketplace Transactions =====

interface ListTransactionsParams {
  role?: 'buyer' | 'seller';
  status?: 'pendiente' | 'confirmada' | 'completada' | 'cancelada';
  page?: number;
}

export async function createTransaction(payload: CreateTransactionPayload) {
  return apiClient<Transaction>('/marketplace/transactions/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function listTransactions(params: ListTransactionsParams = {}) {
  const query = new URLSearchParams();

  if (params.role) query.set('role', params.role);
  if (params.status) query.set('status', params.status);
  if (params.page && params.page > 1) query.set('page', String(params.page));

  const endpoint = query.toString()
    ? `/marketplace/transactions/?${query.toString()}`
    : '/marketplace/transactions/';

  return apiClient<PaginatedResponse<Transaction>>(endpoint);
}

export async function getTransactionById(id: number | string) {
  return apiClient<Transaction>(`/marketplace/transactions/${id}/`);
}

export async function updateTransactionStatus(
  id: number | string,
  payload: UpdateTransactionStatusPayload,
) {
  return apiClient<Transaction>(`/marketplace/transactions/${id}/status/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function updateSwapProposal(id: number | string, payload: SwapProposalPayload) {
  return apiClient<Transaction>(`/marketplace/transactions/${id}/swap-proposal/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function markSwapNoAccept(id: number | string) {
  return apiClient<Transaction>(`/marketplace/transactions/${id}/swap-no-accept/`, {
    method: 'PATCH',
  });
}

export async function proposeSwapMeeting(
  id: number | string,
  payload: SwapMeetingProposalPayload,
) {
  return apiClient<Transaction>(`/marketplace/transactions/${id}/swap-meeting/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function respondSwapMeeting(
  id: number | string,
  payload: SwapMeetingResponsePayload,
) {
  return apiClient<Transaction>(`/marketplace/transactions/${id}/swap-meeting-response/`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}
