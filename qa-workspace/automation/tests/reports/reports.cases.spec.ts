/**
 * reports.cases.spec.ts — PERMANENT automation asset (1:1 with test-cases/Reports/reports.md).
 * One named test per documented TC-ID (15 cases). Each dispatches through
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

test.describe('Reports · reports (15 cases)', () => {
  test('TC-RPT-001 — case', async () => { await runCase(api, 'TC-RPT-001'); });
  test('TC-RPT-002 — case', async () => { await runCase(api, 'TC-RPT-002'); });
  test('TC-RPT-003 — case', async () => { await runCase(api, 'TC-RPT-003'); });
  test('TC-RPT-004 — case', async () => { await runCase(api, 'TC-RPT-004'); });
  test('TC-RPT-005 — case', async () => { await runCase(api, 'TC-RPT-005'); });
  test('TC-RPT-006 — case', async () => { await runCase(api, 'TC-RPT-006'); });
  test('TC-RPT-007 — case', async () => { await runCase(api, 'TC-RPT-007'); });
  test('TC-RPT-008 — case', async () => { await runCase(api, 'TC-RPT-008'); });
  test('TC-RPT-009 — Export format integrity', async () => { await runCase(api, 'TC-RPT-009'); });
  test('TC-RPT-010 — Empty/edge data', async () => { await runCase(api, 'TC-RPT-010'); });
  test('TC-RPT-011 — Permission gating', async () => { await runCase(api, 'TC-RPT-011'); });
  test('TC-RPT-012 — Per-employee detail = calc', async () => { await runCase(api, 'TC-RPT-012'); });
  test('TC-RPT-013 — Gap: Payslips not a report', async () => { await runCase(api, 'TC-RPT-013'); });
  test('TC-RPT-014 — Gap: redirect/unimplemented pages', async () => { await runCase(api, 'TC-RPT-014'); });
  test('TC-RPT-015 — Gap: AI Insights preview', async () => { await runCase(api, 'TC-RPT-015'); });
});
