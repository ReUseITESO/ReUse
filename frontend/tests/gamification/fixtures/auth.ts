import { request, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const API_BASE = 'http://127.0.0.1:8000/api';
const STORAGE_DIR = path.join(__dirname, '.auth');

export type TestUser = {
  email: string;
  password: string;
  expectedPoints: number;
  expectedLevel: string;
};

export const USERS: Record<string, TestUser> = {
  beginner: {
    email: 'test@iteso.mx',
    password: 'test1234',
    expectedPoints: 0,
    expectedLevel: 'Beginner Reuser',
  },
  active: {
    email: 'rodrigo@iteso.mx',
    password: 'rodrigo1234',
    expectedPoints: 100,
    expectedLevel: 'Active Reuser',
  },
  champion: {
    email: 'carlos@iteso.mx',
    password: 'carlos1234',
    expectedPoints: 300,
    expectedLevel: 'Eco Champion',
  },
  leader: {
    email: 'maria@iteso.mx',
    password: 'maria1234',
    expectedPoints: 600,
    expectedLevel: 'Sustainability Leader',
  },
  gam02a: {
    email: 'jose.chavez@iteso.mx',
    password: 'ReUse2026!',
    expectedPoints: 350,
    expectedLevel: 'Eco Champion',
  },
};

export function storageStatePath(userKey: string): string {
  return path.join(STORAGE_DIR, `${userKey}.json`);
}

/**
 * Login via API, then build a Playwright storageState JSON with tokens
 * injected into localStorage (matches what src/lib/auth.ts does in the browser).
 *
 * Skips the login if the stored token is still valid (>60 s remaining),
 * which avoids consuming auth throttle slots on rapid re-runs.
 */
export async function createStorageStateForUser(userKey: string): Promise<void> {
  const user = USERS[userKey];
  if (!user) throw new Error(`Unknown user key: ${userKey}`);

  // Reuse existing token when still valid to avoid auth rate-limit on rapid re-runs
  const statePath = storageStatePath(userKey);
  if (fs.existsSync(statePath)) {
    try {
      const state = JSON.parse(fs.readFileSync(statePath, 'utf-8'));
      const ls: { name: string; value: string }[] = state.origins[0].localStorage;
      const accessToken = ls.find(e => e.name === 'reuse_access_token')?.value;
      if (accessToken) {
        const payload = JSON.parse(
          Buffer.from(accessToken.split('.')[1], 'base64').toString(),
        );
        const secondsRemaining = payload.exp - Math.floor(Date.now() / 1000);
        if (secondsRemaining > 60) {
          return; // Token still good — skip login
        }
      }
    } catch {
      // Corrupted file — fall through to fresh login
    }
  }

  const ctx = await request.newContext();
  const response = await ctx.post(`${API_BASE}/auth/signin/`, {
    data: { email: user.email, password: user.password },
  });
  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  const { access, refresh } = body.tokens;

  fs.mkdirSync(STORAGE_DIR, { recursive: true });
  const storageState = {
    cookies: [],
    origins: [
      {
        origin: 'http://localhost:3000',
        localStorage: [
          { name: 'reuse_access_token', value: access },
          { name: 'reuse_refresh_token', value: refresh },
        ],
      },
    ],
  };
  fs.writeFileSync(storageStatePath(userKey), JSON.stringify(storageState, null, 2));
  await ctx.dispose();
}
