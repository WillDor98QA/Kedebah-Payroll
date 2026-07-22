/**
 * payslips.cases.spec.ts — PERMANENT automation asset (1:1 with test-cases/Payroll/payslips.md).
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

test.describe('Payroll · payslips (16 cases)', () => {
  test('TC-SLIP-001 — Download gated on Paid+Paid', async () => { await runCase(api, 'TC-SLIP-001'); });
  test('TC-SLIP-002 — Not available before Paid', async () => { await runCase(api, 'TC-SLIP-002'); });
  test('TC-SLIP-003 — Not available if employee not paid', async () => { await runCase(api, 'TC-SLIP-003'); });
  test('TC-SLIP-004 — Snapshot-based (no recompute)', async () => { await runCase(api, 'TC-SLIP-004'); });
  test('TC-SLIP-005 — PDF identity/header', async () => { await runCase(api, 'TC-SLIP-005'); });
  test('TC-SLIP-006 — PDF payment details masked', async () => { await runCase(api, 'TC-SLIP-006'); });
  test('TC-SLIP-007 — PDF earnings exclude BIK', async () => { await runCase(api, 'TC-SLIP-007'); });
  test('TC-SLIP-008 — Two deduction groups', async () => { await runCase(api, 'TC-SLIP-008'); });
  test('TC-SLIP-009 — Same-name combine (loans)', async () => { await runCase(api, 'TC-SLIP-009'); });
  test('TC-SLIP-010 — PDF totals + words', async () => { await runCase(api, 'TC-SLIP-010'); });
  test('TC-SLIP-011 — List own payslips', async () => { await runCase(api, 'TC-SLIP-011'); });
  test('TC-SLIP-012 — Current payslip', async () => { await runCase(api, 'TC-SLIP-012'); });
  test('TC-SLIP-013 — Download one + all', async () => { await runCase(api, 'TC-SLIP-013'); });
  test('TC-SLIP-014 — No admin perm needed', async () => { await runCase(api, 'TC-SLIP-014'); });
  test('TC-SLIP-015 — Cross-employee blocked (IDOR)', async () => { await runCase(api, 'TC-SLIP-015'); });
  test('TC-SLIP-016 — Gap: this-app My Payslips placeholder', async () => { await runCase(api, 'TC-SLIP-016'); });
});
