/**
 * roles.fixture.ts — per-role authenticated browser contexts + API clients.
 * Browser pages reuse the storage state saved by the `setup` project; API clients are built from the
 * same state (Sanctum Bearer + X-Tenant-Id) via ApiClient.fromState.
 */

import { test as base, expect, Page } from '@playwright/test';
import { ApiClient } from '../helpers/api-client.js';

type RoleFixtures = {
  adminPage: Page;
  managerPage: Page;
  staffPage: Page;
  adminApi: ApiClient;
  staffApi: ApiClient;
};

async function pageForRole(browser: import('@playwright/test').Browser, role: 'admin' | 'manager' | 'staff') {
  const context = await browser.newContext({ storageState: `fixtures/.auth/${role}.json` });
  return context.newPage();
}

export const test = base.extend<RoleFixtures>({
  adminPage: async ({ browser }, use) => use(await pageForRole(browser, 'admin')),
  managerPage: async ({ browser }, use) => use(await pageForRole(browser, 'manager')),
  staffPage: async ({ browser }, use) => use(await pageForRole(browser, 'staff')),
  adminApi: async ({}, use) => {
    const api = await ApiClient.fromState('fixtures/.auth/admin.json');
    await use(api);
    await api.dispose();
  },
  staffApi: async ({}, use) => {
    const api = await ApiClient.fromState('fixtures/.auth/staff.json');
    await use(api);
    await api.dispose();
  },
});

export { expect };
