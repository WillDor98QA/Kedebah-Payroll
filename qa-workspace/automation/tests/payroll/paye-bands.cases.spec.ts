/**
 * paye-bands.cases.spec.ts — PERMANENT automation asset (1:1 with test-cases/Payroll/paye-bands.md).
 * One named test per documented TC-ID (17 cases). Each dispatches through
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

test.describe('Payroll · paye-bands (17 cases)', () => {
  test('TC-PAYE-001 — 490.00 (band-1 ceiling)', async () => { await runCase(api, 'TC-PAYE-001'); });
  test('TC-PAYE-002 — 400.00 (within band 1)', async () => { await runCase(api, 'TC-PAYE-002'); });
  test('TC-PAYE-003 — 600.00 (band-2 ceiling)', async () => { await runCase(api, 'TC-PAYE-003'); });
  test('TC-PAYE-004 — 550.00 (within band 2)', async () => { await runCase(api, 'TC-PAYE-004'); });
  test('TC-PAYE-005 — 730.00 (band-3 ceiling)', async () => { await runCase(api, 'TC-PAYE-005'); });
  test('TC-PAYE-006 — 3,896.67 (band-4 ceiling)', async () => { await runCase(api, 'TC-PAYE-006'); });
  test('TC-PAYE-007 — 19,896.67 (band-5 ceiling)', async () => { await runCase(api, 'TC-PAYE-007'); });
  test('TC-PAYE-008 — 50,416.67 (band-6 ceiling)', async () => { await runCase(api, 'TC-PAYE-008'); });
  test('TC-PAYE-009 — 60,000.00 (into band 7)', async () => { await runCase(api, 'TC-PAYE-009'); });
  test('TC-PAYE-010 — 490.01 (just over band 1)', async () => { await runCase(api, 'TC-PAYE-010'); });
  test('TC-PAYE-011 — 600.01 (just over band 2)', async () => { await runCase(api, 'TC-PAYE-011'); });
  test('TC-PAYE-012 — Mid-band 5,000', async () => { await runCase(api, 'TC-PAYE-012'); });
  test('TC-PAYE-013 — Mid-band 25,000', async () => { await runCase(api, 'TC-PAYE-013'); });
  test('TC-PAYE-014 — Chargeable base = qualifying income − reliefs + taxable BIK − before-tax deductions', async () => { await runCase(api, 'TC-PAYE-014'); });
  test('TC-PAYE-015 — Non-taxable items excluded from base', async () => { await runCase(api, 'TC-PAYE-015'); });
  test('TC-PAYE-016 — Band-by-band breakdown UI', async () => { await runCase(api, 'TC-PAYE-016'); });
  test('TC-PAYE-017 — Zero chargeable income', async () => { await runCase(api, 'TC-PAYE-017'); });
});
