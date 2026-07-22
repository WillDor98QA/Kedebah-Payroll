/**
 * run-types.cases.spec.ts — PERMANENT automation asset (1:1 with test-cases/Payroll/run-types.md).
 * One named test per documented TC-ID (22 cases). Each dispatches through
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

test.describe('Payroll · run-types (22 cases)', () => {
  test('TC-RUN-001 — Regular includes everything', async () => { await runCase(api, 'TC-RUN-001'); });
  test('TC-RUN-002 — Regular only overtime ad-hoc', async () => { await runCase(api, 'TC-RUN-002'); });
  test('TC-RUN-003 — No-group population', async () => { await runCase(api, 'TC-RUN-003'); });
  test('TC-RUN-004 — Regular advances calendar', async () => { await runCase(api, 'TC-RUN-004'); });
  test('TC-RUN-005 — Bonus excludes basic/benefits/deductions', async () => { await runCase(api, 'TC-RUN-005'); });
  test('TC-RUN-006 — Bonus Tier1/2/3 = 0', async () => { await runCase(api, 'TC-RUN-006'); });
  test('TC-RUN-007 — Bonus tax applies', async () => { await runCase(api, 'TC-RUN-007'); });
  test('TC-RUN-008 — Bonus period optional', async () => { await runCase(api, 'TC-RUN-008'); });
  test('TC-RUN-009 — Bonus does NOT advance calendar', async () => { await runCase(api, 'TC-RUN-009'); });
  test('TC-RUN-010 — Default pays only entered amounts', async () => { await runCase(api, 'TC-RUN-010'); });
  test('TC-RUN-011 — Benefits flag Yes', async () => { await runCase(api, 'TC-RUN-011'); });
  test('TC-RUN-012 — Deductions flag Yes', async () => { await runCase(api, 'TC-RUN-012'); });
  test('TC-RUN-013 — Regular-salary flag Yes', async () => { await runCase(api, 'TC-RUN-013'); });
  test('TC-RUN-014 — Flag badges shown', async () => { await runCase(api, 'TC-RUN-014'); });
  test('TC-RUN-015 — Own date range', async () => { await runCase(api, 'TC-RUN-015'); });
  test('TC-RUN-016 — Off-cycle no advance', async () => { await runCase(api, 'TC-RUN-016'); });
  test('TC-RUN-017 — Termination includes basic + statutory', async () => { await runCase(api, 'TC-RUN-017'); });
  test('TC-RUN-018 — No recurring benefits/deductions', async () => { await runCase(api, 'TC-RUN-018'); });
  test('TC-RUN-019 — Entitlements/recoveries as adjustments', async () => { await runCase(api, 'TC-RUN-019'); });
  test('TC-RUN-020 — Records last working day', async () => { await runCase(api, 'TC-RUN-020'); });
  test('TC-RUN-021 — Termination no advance', async () => { await runCase(api, 'TC-RUN-021'); });
  test('TC-RUN-022 — Termination loans resolve', async () => { await runCase(api, 'TC-RUN-022'); });
});
