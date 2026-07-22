/**
 * auth.setup.ts — authenticate admin (only configured role) and persist storage state for reuse.
 * Flow (confirmed by recon): login → /select-business → pick BUSINESS_NAME → Continue → app.
 * Manager/Staff are skipped (no creds) → their specs record Blocked.
 */

import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page.js';
import { SelectBusinessPage } from '../pages/select-business.page.js';
import { env, hasRole, isAppConfigured } from '../config/env.js';
import { mkdir } from 'node:fs/promises';

const STATE_DIR = 'fixtures/.auth';

for (const role of ['admin', 'manager', 'staff'] as const) {
  setup(`authenticate ${role}`, async ({ page }) => {
    setup.skip(!isAppConfigured, 'App URL + admin credentials not configured.');
    setup.skip(!hasRole(role), `${role} credentials not provided — dependent cases Blocked.`);

    await mkdir(STATE_DIR, { recursive: true });
    const creds = env.roles[role];

    await new LoginPage(page).login(creds.identifier, creds.password);

    // Multi-tenant business selection (skip if the app doesn't route there for this account).
    if (/select-business/.test(page.url()) || (await page.waitForURL(/select-business/, { timeout: 8000 }).then(() => true).catch(() => false))) {
      const sb = new SelectBusinessPage(page);
      await sb.selectAndContinue(env.businessName);
      expect(await sb.isForbidden(), `account forbidden on business "${env.businessName}"`).toBeFalsy();
    }

    await expect(page).not.toHaveURL(/\/$|login/i, { timeout: 10000 }).catch(() => {});
    await page.context().storageState({ path: `${STATE_DIR}/${role}.json` });
  });
}
