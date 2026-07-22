/**
 * payments-disbursement.cases.spec.ts — PERMANENT automation asset (1:1 with test-cases/Payroll/payments-disbursement.md).
 * One named test per documented TC-ID (18 cases). Each dispatches through
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

test.describe('Payroll · payments-disbursement (18 cases)', () => {
  test('TC-PAYM-001 — Files action on Approved (Run Payroll tab)', async () => { await runCase(api, 'TC-PAYM-001'); });
  test('TC-PAYM-002 — Files action on Paid (History tab)', async () => { await runCase(api, 'TC-PAYM-002'); });
  test('TC-PAYM-003 — Bank file structure', async () => { await runCase(api, 'TC-PAYM-003'); });
  test('TC-PAYM-004 — Bank file columns/order', async () => { await runCase(api, 'TC-PAYM-004'); });
  test('TC-PAYM-005 — Sort: bank then employee name', async () => { await runCase(api, 'TC-PAYM-005'); });
  test('TC-PAYM-006 — Correct sort code per employee', async () => { await runCase(api, 'TC-PAYM-006'); });
  test('TC-PAYM-007 — MoMo rows in file', async () => { await runCase(api, 'TC-PAYM-007'); });
  test('TC-PAYM-008 — Cash excluded', async () => { await runCase(api, 'TC-PAYM-008'); });
  test('TC-PAYM-009 — Missing-details excluded', async () => { await runCase(api, 'TC-PAYM-009'); });
  test('TC-PAYM-010 — TOTAL row correctness', async () => { await runCase(api, 'TC-PAYM-010'); });
  test('TC-PAYM-011 — Payment Reference dash', async () => { await runCase(api, 'TC-PAYM-011'); });
  test('TC-PAYM-012 — Gap: skip reasons not in modal', async () => { await runCase(api, 'TC-PAYM-012'); });
  test('TC-PAYM-013 — Export recorded in audit', async () => { await runCase(api, 'TC-PAYM-013'); });
  test('TC-PAYM-014 — Per-employee payment status', async () => { await runCase(api, 'TC-PAYM-014'); });
  test('TC-PAYM-015 — Mark all as paid', async () => { await runCase(api, 'TC-PAYM-015'); });
  test('TC-PAYM-016 — Proof of payment upload', async () => { await runCase(api, 'TC-PAYM-016'); });
  test('TC-PAYM-017 — Run currency default', async () => { await runCase(api, 'TC-PAYM-017'); });
  test('TC-PAYM-018 — Gap: Payments submenu previews', async () => { await runCase(api, 'TC-PAYM-018'); });
});
