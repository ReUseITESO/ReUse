import { request } from '@playwright/test';

const API_BASE = 'http://127.0.0.1:8000/api';

export async function getMarketplaceTokens(email: string, password: string) {
  const ctx = await request.newContext();
  const response = await ctx.post(`${API_BASE}/auth/signin/`, {
    data: { email, password },
  });

  if (!response.ok()) {
    const errorBody = await response.text();
    throw new Error(`Auth Failed (${response.status()}): ${errorBody}`);
  }

  const body = await response.json();
  await ctx.dispose();
  
  // Return the tokens so we can inject them manually
  return {
    access: body.tokens.access,
    refresh: body.tokens.refresh
  };
}