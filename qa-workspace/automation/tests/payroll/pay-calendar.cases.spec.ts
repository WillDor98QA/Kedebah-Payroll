/**
 * pay-calendar.cases.spec.ts — PERMANENT automation asset (1:1 with test-cases/Payroll/pay-calendar.md).
 * One named test per documented TC-ID (20 cases). Each dispatches through
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

test.describe('Payroll · pay-calendar (20 cases)', () => {
  test('TC-CYCLE-001 — Each frequency selectable', async () => { await runCase(api, 'TC-CYCLE-001'); });
  test('TC-CYCLE-002 — First-period anchor (calendar-aligned)', async () => { await runCase(api, 'TC-CYCLE-002'); });
  test('TC-CYCLE-003 — First-period anchor (custom shape)', async () => { await runCase(api, 'TC-CYCLE-003'); });
  test('TC-CYCLE-004 — Pay date offset', async () => { await runCase(api, 'TC-CYCLE-004'); });
  test('TC-CYCLE-005 — Offset 0 = last day', async () => { await runCase(api, 'TC-CYCLE-005'); });
  test('TC-CYCLE-006 — Cutoff days', async () => { await runCase(api, 'TC-CYCLE-006'); });
  test('TC-CYCLE-007 — Buffer = 1 Current + 3 Scheduled', async () => { await runCase(api, 'TC-CYCLE-007'); });
  test('TC-CYCLE-008 — Lifecycle states', async () => { await runCase(api, 'TC-CYCLE-008'); });
  test('TC-CYCLE-009 — Regular-Paid advances + tops buffer', async () => { await runCase(api, 'TC-CYCLE-009'); });
  test('TC-CYCLE-010 — Non-regular no advance', async () => { await runCase(api, 'TC-CYCLE-010'); });
  test('TC-CYCLE-011 — Create-run default = Current', async () => { await runCase(api, 'TC-CYCLE-011'); });
  test('TC-CYCLE-012 — Weekend pay-date → Friday', async () => { await runCase(api, 'TC-CYCLE-012'); });
  test('TC-CYCLE-013 — Saturday pay-date → Friday', async () => { await runCase(api, 'TC-CYCLE-013'); });
  test('TC-CYCLE-014 — Monthly month-end snap', async () => { await runCase(api, 'TC-CYCLE-014'); });
  test('TC-CYCLE-015 — Semi-monthly split incl. short Feb', async () => { await runCase(api, 'TC-CYCLE-015'); });
  test('TC-CYCLE-016 — Quarterly +3 months', async () => { await runCase(api, 'TC-CYCLE-016'); });
  test('TC-CYCLE-017 — Leap-year Feb 29', async () => { await runCase(api, 'TC-CYCLE-017'); });
  test('TC-CYCLE-018 — Change regenerates only empty future Scheduled', async () => { await runCase(api, 'TC-CYCLE-018'); });
  test('TC-CYCLE-019 — History preserved on change', async () => { await runCase(api, 'TC-CYCLE-019'); });
  test('TC-CYCLE-020 — Change effective next open period', async () => { await runCase(api, 'TC-CYCLE-020'); });
});
