/**
 * taxes-forms-filings.cases.spec.ts — PERMANENT automation asset (1:1 with test-cases/Payroll/taxes-forms-filings.md).
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

test.describe('Payroll · taxes-forms-filings (12 cases)', () => {
  test('TC-FORM-001 — Liabilities on approve', async () => { await runCase(api, 'TC-FORM-001'); });
  test('TC-FORM-002 — Due dates from filing rules', async () => { await runCase(api, 'TC-FORM-002'); });
  test('TC-FORM-003 — One form per filing period', async () => { await runCase(api, 'TC-FORM-003'); });
  test('TC-FORM-004 — Attach to Pending form (recompute)', async () => { await runCase(api, 'TC-FORM-004'); });
  test('TC-FORM-005 — Locked form → supplementary', async () => { await runCase(api, 'TC-FORM-005'); });
  test('TC-FORM-006 — Filed form not mutated', async () => { await runCase(api, 'TC-FORM-006'); });
  test('TC-FORM-007 — Files modal 3 outputs enablement', async () => { await runCase(api, 'TC-FORM-007'); });
  test('TC-FORM-008 — Muted unavailable note', async () => { await runCase(api, 'TC-FORM-008'); });
  test('TC-FORM-009 — Forms own approval flow', async () => { await runCase(api, 'TC-FORM-009'); });
  test('TC-FORM-010 — Filing status tracking', async () => { await runCase(api, 'TC-FORM-010'); });
  test('TC-FORM-011 — GRA PAYE export integrity + speed', async () => { await runCase(api, 'TC-FORM-011'); });
  test('TC-FORM-012 — Liability amounts re-derived', async () => { await runCase(api, 'TC-FORM-012'); });
});
