/**
 * employer-loans.cases.spec.ts — PERMANENT automation asset (1:1 with test-cases/Loans/employer-loans.md).
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

test.describe('Loans · employer-loans (16 cases)', () => {
  test('TC-LOAN-001 — Create loan', async () => { await runCase(api, 'TC-LOAN-001'); });
  test('TC-LOAN-002 — Edit/close loan', async () => { await runCase(api, 'TC-LOAN-002'); });
  test('TC-LOAN-003 — Permission gating', async () => { await runCase(api, 'TC-LOAN-003'); });
  test('TC-LOAN-004 — Loan BIK when rate < reference', async () => { await runCase(api, 'TC-LOAN-004'); });
  test('TC-LOAN-005 — No BIK when rate ≥ reference', async () => { await runCase(api, 'TC-LOAN-005'); });
  test('TC-LOAN-006 — Exempt loan → no BIK', async () => { await runCase(api, 'TC-LOAN-006'); });
  test('TC-LOAN-007 — Repayment from net after tax', async () => { await runCase(api, 'TC-LOAN-007'); });
  test('TC-LOAN-008 — Repayment clamped to balance', async () => { await runCase(api, 'TC-LOAN-008'); });
  test('TC-LOAN-009 — Draft does NOT decrement balance', async () => { await runCase(api, 'TC-LOAN-009'); });
  test('TC-LOAN-010 — Mark Paid decrements by actual taken', async () => { await runCase(api, 'TC-LOAN-010'); });
  test('TC-LOAN-011 — Independent multi-loan balances', async () => { await runCase(api, 'TC-LOAN-011'); });
  test('TC-LOAN-012 — Combined payslip line', async () => { await runCase(api, 'TC-LOAN-012'); });
  test('TC-LOAN-013 — Auto-stop when repaid', async () => { await runCase(api, 'TC-LOAN-013'); });
  test('TC-LOAN-014 — Continue while balance remains', async () => { await runCase(api, 'TC-LOAN-014'); });
  test('TC-LOAN-015 — Gap: Loans submenu previews', async () => { await runCase(api, 'TC-LOAN-015'); });
  test('TC-LOAN-016 — Loan BIK value re-derived', async () => { await runCase(api, 'TC-LOAN-016'); });
});
