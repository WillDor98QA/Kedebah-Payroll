/**
 * compliance.cases.spec.ts — PERMANENT automation asset (1:1 with test-cases/Compliance/compliance.md).
 * One named test per documented TC-ID (10 cases). Each dispatches through
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

test.describe('Compliance · compliance (10 cases)', () => {
  test('TC-COMP-001 — Every mutation logged', async () => { await runCase(api, 'TC-COMP-001'); });
  test('TC-COMP-002 — Change history', async () => { await runCase(api, 'TC-COMP-002'); });
  test('TC-COMP-003 — Approval trail', async () => { await runCase(api, 'TC-COMP-003'); });
  test('TC-COMP-004 — Statutory filing history', async () => { await runCase(api, 'TC-COMP-004'); });
  test('TC-COMP-005 — Compliance alerts', async () => { await runCase(api, 'TC-COMP-005'); });
  test('TC-COMP-006 — Dual audit trail immutable', async () => { await runCase(api, 'TC-COMP-006'); });
  test('TC-COMP-007 — Audit completeness across lifecycle', async () => { await runCase(api, 'TC-COMP-007'); });
  test('TC-COMP-008 — Gap: My Earnings placeholder', async () => { await runCase(api, 'TC-COMP-008'); });
  test('TC-COMP-009 — Gap: My Loans placeholder', async () => { await runCase(api, 'TC-COMP-009'); });
  test('TC-COMP-010 — Gap: Queries placeholder', async () => { await runCase(api, 'TC-COMP-010'); });
});
