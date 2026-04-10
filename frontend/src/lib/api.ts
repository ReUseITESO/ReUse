import { getStoredTokens, refreshAndStore, clearTokens } from '@/lib/auth';
import type { ProductReactionSummary, ProductReactionType } from '@/types/product';

import type { PaginatedResponse } from '@/types/api';
import type { Comment } from '@/types/comment';
import type {
  CreateTransactionPayload,
  Transaction,
  TransactionReview,
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

// ===== Marketplace Comments =====

export async function listComments(productId: number, page = 1) {
  const query = page > 1 ? `?page=${page}` : '';
  return apiClient<PaginatedResponse<Comment>>(
    `/marketplace/products/${productId}/comments/${query}`,
  );
}

export async function createComment(productId: number, content: string) {
  return apiClient<Comment>(`/marketplace/products/${productId}/comments/`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

export async function deleteComment(productId: number, commentId: number) {
  return apiClient<null>(`/marketplace/products/${productId}/comments/${commentId}/`, {
// ===== Transactions =====

export async function getTransactionHistory(params?: {
  transaction_type?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
}) {
  const query = new URLSearchParams();
  if (params?.transaction_type) query.set('transaction_type', params.transaction_type);
  if (params?.date_from) query.set('date_from', params.date_from);
  if (params?.date_to) query.set('date_to', params.date_to);
  if (params?.page && params.page > 1) query.set('page', String(params.page));
  const qs = query.toString();
  return apiClient(`/marketplace/transactions/history/${qs ? `?${qs}` : ''}`);
}

export async function submitTransactionReview(
  transactionId: number,
  payload: { rating: number; comment?: string },
): Promise<TransactionReview> {
  return apiClient(`/marketplace/transactions/${transactionId}/review/`, {
    method: 'POST',
    body: JSON.stringify(payload),
  }) as Promise<TransactionReview>;
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
