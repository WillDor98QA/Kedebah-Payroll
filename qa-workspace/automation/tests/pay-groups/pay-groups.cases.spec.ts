/**
 * pay-groups.cases.spec.ts — PERMANENT automation asset (1:1 with test-cases/Pay Groups/pay-groups.md).
 * One named test per documented TC-ID (12 cases). Each dispatches through
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

test.describe('Pay Groups · pay-groups (12 cases)', () => {
  test('TC-PG-001 — Create pay group', async () => { await runCase(api, 'TC-PG-001'); });
  test('TC-PG-002 — Edit membership', async () => { await runCase(api, 'TC-PG-002'); });
  test('TC-PG-003 — Delete pay group', async () => { await runCase(api, 'TC-PG-003'); });
  test('TC-PG-004 — Permission gating', async () => { await runCase(api, 'TC-PG-004'); });
  test('TC-PG-005 — Group pre-populates run', async () => { await runCase(api, 'TC-PG-005'); });
  test('TC-PG-006 — No-group regular run = all active', async () => { await runCase(api, 'TC-PG-006'); });
  test('TC-PG-007 — Eligibility at period end', async () => { await runCase(api, 'TC-PG-007'); });
  test('TC-PG-008 — Shared benefit applies to members', async () => { await runCase(api, 'TC-PG-008'); });
  test('TC-PG-009 — Shared deduction applies', async () => { await runCase(api, 'TC-PG-009'); });
  test('TC-PG-010 — Group protected-pay rule', async () => { await runCase(api, 'TC-PG-010'); });
  test('TC-PG-011 — Layered resolution order', async () => { await runCase(api, 'TC-PG-011'); });
  test('TC-PG-012 — Individual override beats group', async () => { await runCase(api, 'TC-PG-012'); });
});
