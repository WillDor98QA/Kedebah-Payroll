/**
 * calculation-engine.cases.spec.ts — PERMANENT automation asset (1:1 with test-cases/Payroll/calculation-engine.md).
 * One named test per documented TC-ID (24 cases). Each dispatches through
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

test.describe('Payroll · calculation-engine (24 cases)', () => {
  test('TC-CAL-001 — Basic per compensation type', async () => { await runCase(api, 'TC-CAL-001'); });
  test('TC-CAL-002 — Run-type flags resolved', async () => { await runCase(api, 'TC-CAL-002'); });
  test('TC-CAL-003 — Bonus amount fixed', async () => { await runCase(api, 'TC-CAL-003'); });
  test('TC-CAL-004 — Bonus amount % basic', async () => { await runCase(api, 'TC-CAL-004'); });
  test('TC-CAL-005 — Recurring benefits resolved by scope', async () => { await runCase(api, 'TC-CAL-005'); });
  test('TC-CAL-006 — Earnings vs benefits categorised', async () => { await runCase(api, 'TC-CAL-006'); });
  test('TC-CAL-007 — Deductions before/after split', async () => { await runCase(api, 'TC-CAL-007'); });
  test('TC-CAL-008 — %-of-net deferred to pass 2', async () => { await runCase(api, 'TC-CAL-008'); });
  test('TC-CAL-009 — Ad-hoc earnings + dedupe', async () => { await runCase(api, 'TC-CAL-009'); });
  test('TC-CAL-010 — Catalog-linked no-amount inherits', async () => { await runCase(api, 'TC-CAL-010'); });
  test('TC-CAL-011 — Gross pay sum', async () => { await runCase(api, 'TC-CAL-011'); });
  test('TC-CAL-012 — Ad-hoc deductions w/ treatment', async () => { await runCase(api, 'TC-CAL-012'); });
  test('TC-CAL-013 — Tax pipeline order a→j', async () => { await runCase(api, 'TC-CAL-013'); });
  test('TC-CAL-014 — Protected-pay step', async () => { await runCase(api, 'TC-CAL-014'); });
  test('TC-CAL-015 — %-of-net second pass', async () => { await runCase(api, 'TC-CAL-015'); });
  test('TC-CAL-016 — Net pay formula', async () => { await runCase(api, 'TC-CAL-016'); });
  test('TC-CAL-017 — Negative net → error', async () => { await runCase(api, 'TC-CAL-017'); });
  test('TC-CAL-018 — Employer cost', async () => { await runCase(api, 'TC-CAL-018'); });
  test('TC-CAL-019 — Status: Calculated', async () => { await runCase(api, 'TC-CAL-019'); });
  test('TC-CAL-020 — Status: Warning', async () => { await runCase(api, 'TC-CAL-020'); });
  test('TC-CAL-021 — Status: Error', async () => { await runCase(api, 'TC-CAL-021'); });
  test('TC-CAL-022 — Snapshot fidelity', async () => { await runCase(api, 'TC-CAL-022'); });
  test('TC-CAL-023 — Rounding consistency', async () => { await runCase(api, 'TC-CAL-023'); });
  test('TC-CAL-024 — End-to-end integration persona', async () => { await runCase(api, 'TC-CAL-024'); });
});
