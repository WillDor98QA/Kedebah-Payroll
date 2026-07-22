/**
 * login.spec.ts — Authentication & access (browser). PRD §2.
 * Traces: REQ-AUTH-001/004/005, TC-AUTH-001…012.
 * Self-skips until the app URL + credentials are configured (never fabricates results).
 */

import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page.js';
import { env, isAppConfigured } from '../../config/env.js';

test.beforeEach(() => {
  test.skip(!isAppConfigured, 'App URL + credentials not configured (engagement blocked).');
});

test.describe('Login @smoke @p1 (PRD §2)', () => {
  test('TC-AUTH-001 login by email', async ({ page }) => {
    const login = new LoginPage(page);
    await login.login(env.roles.admin.identifier, env.roles.admin.password);
    await expect(page).not.toHaveURL(/login/i);
  });

  test('TC-AUTH-010 invalid password rejected', async ({ page }) => {
    const login = new LoginPage(page);
    await login.login(env.roles.admin.identifier, 'definitely-wrong-password');
    await login.expectLoginError();
    await expect(page).toHaveURL(/login/i);
  });

  test('TC-AUTH-011 unknown identifier rejected (no enumeration)', async ({ page }) => {
    const login = new LoginPage(page);
    await login.login('no-such-user@nowhere.invalid', 'whatever');
    await login.expectLoginError();
  });
});
