/**
 * special-tax-engines.cases.spec.ts — PERMANENT automation asset (1:1 with test-cases/Payroll/special-tax-engines.md).
 * One named test per documented TC-ID (23 cases). Each dispatches through
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

test.describe('Payroll · special-tax-engines (23 cases)', () => {
  test('TC-STAX-001 — Annual cap = 15% × (12×monthly basic)', async () => { await runCase(api, 'TC-STAX-001'); });
  test('TC-STAX-002 — Bonus within cap → 5% final', async () => { await runCase(api, 'TC-STAX-002'); });
  test('TC-STAX-003 — YTD cumulative within cap', async () => { await runCase(api, 'TC-STAX-003'); });
  test('TC-STAX-004 — Excess over cap → marginal', async () => { await runCase(api, 'TC-STAX-004'); });
  test('TC-STAX-005 — Fully over cap', async () => { await runCase(api, 'TC-STAX-005'); });
  test('TC-STAX-006 — Reference = synthetic regular run', async () => { await runCase(api, 'TC-STAX-006'); });
  test('TC-STAX-007 — Reconciliation invariant', async () => { await runCase(api, 'TC-STAX-007'); });
  test('TC-STAX-008 — Detail modal breakdown', async () => { await runCase(api, 'TC-STAX-008'); });
  test('TC-STAX-009 — Threshold alert', async () => { await runCase(api, 'TC-STAX-009'); });
  test('TC-STAX-010 — Bonus run Tier1/2/3 = 0', async () => { await runCase(api, 'TC-STAX-010'); });
  test('TC-STAX-011 — Bonus run no period (pay-date year)', async () => { await runCase(api, 'TC-STAX-011'); });
  test('TC-STAX-012 — Junior: 5% up to 50% basic', async () => { await runCase(api, 'TC-STAX-012'); });
  test('TC-STAX-013 — Junior: 10% above 50% basic', async () => { await runCase(api, 'TC-STAX-013'); });
  test('TC-STAX-014 — Senior: marginal PAYE', async () => { await runCase(api, 'TC-STAX-014'); });
  test('TC-STAX-015 — Junior→senior boundary (18k)', async () => { await runCase(api, 'TC-STAX-015'); });
  test('TC-STAX-016 — Config drives rates', async () => { await runCase(api, 'TC-STAX-016'); });
  test('TC-STAX-017 — Statutory fallback', async () => { await runCase(api, 'TC-STAX-017'); });
  test('TC-STAX-018 — Junior threshold alert', async () => { await runCase(api, 'TC-STAX-018'); });
  test('TC-STAX-019 — Gap: no OT entry screen', async () => { await runCase(api, 'TC-STAX-019'); });
  test('TC-STAX-020 — Cap = 35% qualifying income', async () => { await runCase(api, 'TC-STAX-020'); });
  test('TC-STAX-021 — Pension within cap', async () => { await runCase(api, 'TC-STAX-021'); });
  test('TC-STAX-022 — Pension excess alert', async () => { await runCase(api, 'TC-STAX-022'); });
  test('TC-STAX-023 — Counting-items only', async () => { await runCase(api, 'TC-STAX-023'); });
});
