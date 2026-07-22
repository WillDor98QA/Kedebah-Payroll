/**
 * alerts-and-validation.cases.spec.ts — PERMANENT automation asset (1:1 with test-cases/Payroll/alerts-and-validation.md).
 * One named test per documented TC-ID (16 cases). Each dispatches through
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

test.describe('Payroll · alerts-and-validation (16 cases)', () => {
  test('TC-ALRT-001 — case', async () => { await runCase(api, 'TC-ALRT-001'); });
  test('TC-ALRT-002 — case', async () => { await runCase(api, 'TC-ALRT-002'); });
  test('TC-ALRT-003 — case', async () => { await runCase(api, 'TC-ALRT-003'); });
  test('TC-ALRT-004 — case', async () => { await runCase(api, 'TC-ALRT-004'); });
  test('TC-ALRT-005 — case', async () => { await runCase(api, 'TC-ALRT-005'); });
  test('TC-ALRT-006 — case', async () => { await runCase(api, 'TC-ALRT-006'); });
  test('TC-ALRT-007 — case', async () => { await runCase(api, 'TC-ALRT-007'); });
  test('TC-ALRT-008 — case', async () => { await runCase(api, 'TC-ALRT-008'); });
  test('TC-ALRT-009 — case', async () => { await runCase(api, 'TC-ALRT-009'); });
  test('TC-ALRT-010 — case', async () => { await runCase(api, 'TC-ALRT-010'); });
  test('TC-ALRT-011 — case', async () => { await runCase(api, 'TC-ALRT-011'); });
  test('TC-ALRT-012 — case', async () => { await runCase(api, 'TC-ALRT-012'); });
  test('TC-ALRT-013 — case', async () => { await runCase(api, 'TC-ALRT-013'); });
  test('TC-ALRT-014 — Hard vs soft routing', async () => { await runCase(api, 'TC-ALRT-014'); });
  test('TC-ALRT-015 — Alert persistence + acknowledgement', async () => { await runCase(api, 'TC-ALRT-015'); });
  test('TC-ALRT-016 — Consolidated alerts on run', async () => { await runCase(api, 'TC-ALRT-016'); });
});
