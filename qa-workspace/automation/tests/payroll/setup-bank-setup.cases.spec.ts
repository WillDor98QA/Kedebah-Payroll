/**
 * Setup-bank-setup.cases.spec.ts — PERMANENT automation asset (1:1 with test-cases/Payroll/Setup-bank-setup.md).
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

test.describe('Payroll · Setup-bank-setup (16 cases)', () => {
  test('TC-BANK-001 — Seed counts', async () => { await runCase(api, 'TC-BANK-001'); });
  test('TC-BANK-002 — Seed sort codes', async () => { await runCase(api, 'TC-BANK-002'); });
  test('TC-BANK-003 — Seeded identity not editable', async () => { await runCase(api, 'TC-BANK-003'); });
  test('TC-BANK-004 — Seeded record not deletable', async () => { await runCase(api, 'TC-BANK-004'); });
  test('TC-BANK-005 — Seeded status toggle', async () => { await runCase(api, 'TC-BANK-005'); });
  test('TC-BANK-006 — Add new bank', async () => { await runCase(api, 'TC-BANK-006'); });
  test('TC-BANK-007 — Add new branch', async () => { await runCase(api, 'TC-BANK-007'); });
  test('TC-BANK-008 — Bank name unique', async () => { await runCase(api, 'TC-BANK-008'); });
  test('TC-BANK-009 — Branch sort code unique', async () => { await runCase(api, 'TC-BANK-009'); });
  test('TC-BANK-010 — Edit non-seeded', async () => { await runCase(api, 'TC-BANK-010'); });
  test('TC-BANK-011 — Delete-bank guard', async () => { await runCase(api, 'TC-BANK-011'); });
  test('TC-BANK-012 — Delete-branch guard', async () => { await runCase(api, 'TC-BANK-012'); });
  test('TC-BANK-013 — Delete unlinked non-seeded branch', async () => { await runCase(api, 'TC-BANK-013'); });
  test('TC-BANK-014 — No free-text bank anywhere', async () => { await runCase(api, 'TC-BANK-014'); });
  test('TC-BANK-015 — Manager view-only Banks (API)', async () => { await runCase(api, 'TC-BANK-015'); });
  test('TC-BANK-016 — Inactive bank excluded from picker', async () => { await runCase(api, 'TC-BANK-016'); });
});
