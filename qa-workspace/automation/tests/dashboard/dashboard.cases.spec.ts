/**
 * dashboard.cases.spec.ts — PERMANENT automation asset (1:1 with test-cases/Dashboard/dashboard.md).
 * One named test per documented TC-ID (5 cases). Each dispatches through
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

test.describe('Dashboard · dashboard (5 cases)', () => {
  test('TC-DASH-001 — Post-login landing renders', async () => { await runCase(api, 'TC-DASH-001'); });
  test('TC-DASH-002 — No console/network errors', async () => { await runCase(api, 'TC-DASH-002'); });
  test('TC-DASH-003 — Permission-appropriate widgets', async () => { await runCase(api, 'TC-DASH-003'); });
  test('TC-DASH-004 — Navigation from dashboard', async () => { await runCase(api, 'TC-DASH-004'); });
  test('TC-DASH-005 — Responsive rendering', async () => { await runCase(api, 'TC-DASH-005'); });
});
