import { test as setup } from '@playwright/test';
import { createStorageStateForUser, USERS } from './fixtures/auth';

// Run login setups serially to avoid the backend signin rate limiter
setup.describe.configure({ mode: 'serial' });

for (const key of Object.keys(USERS)) {
  setup(`authenticate ${key}`, async () => {
    await createStorageStateForUser(key);
  });
}
