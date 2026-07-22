/**
 * employee-setup.cases.spec.ts — PERMANENT automation asset (1:1 with test-cases/Employees/employee-setup.md).
 * One named test per documented TC-ID (34 cases). Each dispatches through
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

test.describe('Employees · employee-setup (34 cases)', () => {
  test('TC-EMP-001 — Add employee happy path', async () => { await runCase(api, 'TC-EMP-001'); });
  test('TC-EMP-002 — Required-field validation per step', async () => { await runCase(api, 'TC-EMP-002'); });
  test('TC-EMP-003 — Cancel mid-form', async () => { await runCase(api, 'TC-EMP-003'); });
  test('TC-EMP-004 — Bulk import valid', async () => { await runCase(api, 'TC-EMP-004'); });
  test('TC-EMP-005 — Bulk import invalid rows', async () => { await runCase(api, 'TC-EMP-005'); });
  test('TC-EMP-006 — Import History tracked', async () => { await runCase(api, 'TC-EMP-006'); });
  test('TC-EMP-007 — case', async () => { await runCase(api, 'TC-EMP-007'); });
  test('TC-EMP-008 — Monthly basic', async () => { await runCase(api, 'TC-EMP-008'); });
  test('TC-EMP-009 — Daily basic', async () => { await runCase(api, 'TC-EMP-009'); });
  test('TC-EMP-010 — Hourly basic', async () => { await runCase(api, 'TC-EMP-010'); });
  test('TC-EMP-011 — Zero rate → error', async () => { await runCase(api, 'TC-EMP-011'); });
  test('TC-EMP-012 — Missing quantity → error', async () => { await runCase(api, 'TC-EMP-012'); });
  test('TC-EMP-013 — Bank Transfer all fields', async () => { await runCase(api, 'TC-EMP-013'); });
  test('TC-EMP-014 — Bank Transfer missing field', async () => { await runCase(api, 'TC-EMP-014'); });
  test('TC-EMP-015 — Cascading Bank→Branch', async () => { await runCase(api, 'TC-EMP-015'); });
  test('TC-EMP-016 — No free-text bank', async () => { await runCase(api, 'TC-EMP-016'); });
  test('TC-EMP-017 — MoMo — no Account Name required', async () => { await runCase(api, 'TC-EMP-017'); });
  test('TC-EMP-018 — MoMo missing network', async () => { await runCase(api, 'TC-EMP-018'); });
  test('TC-EMP-019 — Cash — no extra fields', async () => { await runCase(api, 'TC-EMP-019'); });
  test('TC-EMP-020 — Masked numbers', async () => { await runCase(api, 'TC-EMP-020'); });
  test('TC-EMP-021 — Payroll Profile readiness', async () => { await runCase(api, 'TC-EMP-021'); });
  test('TC-EMP-022 — Salary assignment effective dates', async () => { await runCase(api, 'TC-EMP-022'); });
  test('TC-EMP-023 — Mid-cycle date warns', async () => { await runCase(api, 'TC-EMP-023'); });
  test('TC-EMP-024 — Gap: no auto-proration', async () => { await runCase(api, 'TC-EMP-024'); });
  test('TC-EMP-025 — Tax & Pension tab', async () => { await runCase(api, 'TC-EMP-025'); });
  test('TC-EMP-026 — Contract renewal alert', async () => { await runCase(api, 'TC-EMP-026'); });
  test('TC-EMP-027 — Gap: Cost Center not saved', async () => { await runCase(api, 'TC-EMP-027'); });
  test('TC-EMP-028 — Cost Center 100% UI rule', async () => { await runCase(api, 'TC-EMP-028'); });
  test('TC-EMP-029 — Benefits & Deductions In-Effect', async () => { await runCase(api, 'TC-EMP-029'); });
  test('TC-EMP-030 — Gap: Payroll Overrides not saved', async () => { await runCase(api, 'TC-EMP-030'); });
  test('TC-EMP-031 — Not-ready excluded/flagged', async () => { await runCase(api, 'TC-EMP-031'); });
  test('TC-EMP-032 — Missing TIN warns only', async () => { await runCase(api, 'TC-EMP-032'); });
  test('TC-EMP-033 — Missing mandatory statutory blocks', async () => { await runCase(api, 'TC-EMP-033'); });
  test('TC-EMP-034 — Exclude incomplete on Process', async () => { await runCase(api, 'TC-EMP-034'); });
});
