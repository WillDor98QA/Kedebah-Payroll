/**
 * deductions-and-protected-pay.cases.spec.ts — PERMANENT automation asset (1:1 with test-cases/Deductions/deductions-and-protected-pay.md).
 * One named test per documented TC-ID (25 cases). Each dispatches through
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

test.describe('Deductions · deductions-and-protected-pay (25 cases)', () => {
  test('TC-DED-001 — Create each deduction type', async () => { await runCase(api, 'TC-DED-001'); });
  test('TC-DED-002 — Calc: Fixed', async () => { await runCase(api, 'TC-DED-002'); });
  test('TC-DED-003 — Calc: % of Basic', async () => { await runCase(api, 'TC-DED-003'); });
  test('TC-DED-004 — Calc: % of Cash Emoluments', async () => { await runCase(api, 'TC-DED-004'); });
  test('TC-DED-005 — Calc: % of Net Pay (second pass)', async () => { await runCase(api, 'TC-DED-005'); });
  test('TC-DED-006 — Before-Tax reduces PAYE base', async () => { await runCase(api, 'TC-DED-006'); });
  test('TC-DED-007 — After-Tax net only', async () => { await runCase(api, 'TC-DED-007'); });
  test('TC-DED-008 — Default = After Tax', async () => { await runCase(api, 'TC-DED-008'); });
  test('TC-DED-009 — Priority recorded', async () => { await runCase(api, 'TC-DED-009'); });
  test('TC-DED-010 — Eligibility scope', async () => { await runCase(api, 'TC-DED-010'); });
  test('TC-DED-011 — Override window', async () => { await runCase(api, 'TC-DED-011'); });
  test('TC-DED-012 — Permission gating', async () => { await runCase(api, 'TC-DED-012'); });
  test('TC-DED-013 — %-of-net not in pass 1', async () => { await runCase(api, 'TC-DED-013'); });
  test('TC-PROT-001 — Floor: absolute', async () => { await runCase(api, 'TC-PROT-001'); });
  test('TC-PROT-002 — Floor: % of gross', async () => { await runCase(api, 'TC-PROT-002'); });
  test('TC-PROT-003 — Floor: % of basic', async () => { await runCase(api, 'TC-PROT-003'); });
  test('TC-PROT-004 — Hard Block', async () => { await runCase(api, 'TC-PROT-004'); });
  test('TC-PROT-005 — Partial Apply + Alert', async () => { await runCase(api, 'TC-PROT-005'); });
  test('TC-PROT-006 — Alert Only', async () => { await runCase(api, 'TC-PROT-006'); });
  test('TC-PROT-007 — Statutory never trimmed', async () => { await runCase(api, 'TC-PROT-007'); });
  test('TC-PROT-008 — Priority trim order', async () => { await runCase(api, 'TC-PROT-008'); });
  test('TC-PROT-009 — Carryover recorded', async () => { await runCase(api, 'TC-PROT-009'); });
  test('TC-PROT-010 — Gap: no auto-recovery', async () => { await runCase(api, 'TC-PROT-010'); });
  test('TC-PROT-011 — Audit storage', async () => { await runCase(api, 'TC-PROT-011'); });
  test('TC-PROT-012 — Floor exactly met (boundary)', async () => { await runCase(api, 'TC-PROT-012'); });
});
