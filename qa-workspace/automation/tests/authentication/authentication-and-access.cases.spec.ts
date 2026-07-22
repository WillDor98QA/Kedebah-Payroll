/**
 * authentication-and-access.cases.spec.ts — PERMANENT automation asset (1:1 with test-cases/Authentication/authentication-and-access.md).
 * One named test per documented TC-ID (19 cases). Each dispatches through
 * helpers/case-runner.ts → real assertion via helpers/tc-registry.ts, or skip-with-documented-reason.
 * Do not delete. To implement a skipped case, add/extend its entry in tc-registry.ts.
 */
import { test } from '@playwright/test';
import { existsSync } from 'node:fs';
import { ApiClient } from '../../helpers/api-client.js';
import { isAppConfigured } from '../../config/env.js';
import { runCase } from '../../helpers/case-runner.js';
import * as F from '../../helpers/qa-factory.js';

const STATE = 'fixtures/.auth/admin.json';
let api: ApiClient;
test.beforeAll(async () => {
  test.skip(!isAppConfigured || !existsSync(STATE), 'Admin storage state unavailable (refresh token).');
  api = await ApiClient.fromState(STATE);
  await F.refs(api);
});
test.afterAll(async () => { if (api) { await F.deactivateAll(api); await api.dispose(); } });

test.describe('Authentication · authentication-and-access (19 cases)', () => {
  test('TC-AUTH-001 — Login by email', async () => { await runCase(api, 'TC-AUTH-001'); });
  test('TC-AUTH-002 — Login by username', async () => { await runCase(api, 'TC-AUTH-002'); });
  test('TC-AUTH-003 — Login by 10-digit phone', async () => { await runCase(api, 'TC-AUTH-003'); });
  test('TC-AUTH-004 — Identifier auto-detection boundary', async () => { await runCase(api, 'TC-AUTH-004'); });
  test('TC-AUTH-005 — Token + permissions persisted', async () => { await runCase(api, 'TC-AUTH-005'); });
  test('TC-AUTH-006 — Protected route after login', async () => { await runCase(api, 'TC-AUTH-006'); });
  test('TC-AUTH-007 — Redirect-after-expiry', async () => { await runCase(api, 'TC-AUTH-007'); });
  test('TC-AUTH-008 — Logout clears session', async () => { await runCase(api, 'TC-AUTH-008'); });
  test('TC-AUTH-009 — Post-logout route guard', async () => { await runCase(api, 'TC-AUTH-009'); });
  test('TC-AUTH-010 — Wrong password', async () => { await runCase(api, 'TC-AUTH-010'); });
  test('TC-AUTH-011 — Unknown identifier', async () => { await runCase(api, 'TC-AUTH-011'); });
  test('TC-AUTH-012 — Empty fields validation', async () => { await runCase(api, 'TC-AUTH-012'); });
  test('TC-AUTH-013 — Admin full access', async () => { await runCase(api, 'TC-AUTH-013'); });
  test('TC-AUTH-014 — Manager operational CRUD', async () => { await runCase(api, 'TC-AUTH-014'); });
  test('TC-AUTH-015 — Manager view-only on Banks (UI)', async () => { await runCase(api, 'TC-AUTH-015'); });
  test('TC-AUTH-016 — Menu gating by permission', async () => { await runCase(api, 'TC-AUTH-016'); });
  test('TC-AUTH-017 — API enforcement despite hidden UI', async () => { await runCase(api, 'TC-AUTH-017'); });
  test('TC-AUTH-018 — Self-service own record', async () => { await runCase(api, 'TC-AUTH-018'); });
  test('TC-AUTH-019 — Self-service cannot reach admin', async () => { await runCase(api, 'TC-AUTH-019'); });
});
