/**
 * lifecycle-and-approval.cases.spec.ts — PERMANENT automation asset (1:1 with test-cases/Payroll/lifecycle-and-approval.md).
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

test.describe('Payroll · lifecycle-and-approval (20 cases)', () => {
  test('TC-LIFE-001 — Happy-path transitions', async () => { await runCase(api, 'TC-LIFE-001'); });
  test('TC-LIFE-002 — Illegal transition blocked', async () => { await runCase(api, 'TC-LIFE-002'); });
  test('TC-LIFE-003 — Reject → draft', async () => { await runCase(api, 'TC-LIFE-003'); });
  test('TC-LIFE-004 — Return to previous stage', async () => { await runCase(api, 'TC-LIFE-004'); });
  test('TC-LIFE-005 — Draft editable + live preview', async () => { await runCase(api, 'TC-LIFE-005'); });
  test('TC-LIFE-006 — Process persists results', async () => { await runCase(api, 'TC-LIFE-006'); });
  test('TC-LIFE-007 — Pre-process blockers listed', async () => { await runCase(api, 'TC-LIFE-007'); });
  test('TC-LIFE-008 — Exclude incomplete to proceed', async () => { await runCase(api, 'TC-LIFE-008'); });
  test('TC-LIFE-009 — Hard blockers stop affected only', async () => { await runCase(api, 'TC-LIFE-009'); });
  test('TC-LIFE-010 — Multi-stage approval enforced', async () => { await runCase(api, 'TC-LIFE-010'); });
  test('TC-LIFE-011 — Reject requires reason', async () => { await runCase(api, 'TC-LIFE-011'); });
  test('TC-LIFE-012 — Approver permission', async () => { await runCase(api, 'TC-LIFE-012'); });
  test('TC-LIFE-013 — On-Approve: liabilities + forms', async () => { await runCase(api, 'TC-LIFE-013'); });
  test('TC-LIFE-014 — Files available after approval (not gated on payment)', async () => { await runCase(api, 'TC-LIFE-014'); });
  test('TC-LIFE-015 — Gap: journal flag logged only', async () => { await runCase(api, 'TC-LIFE-015'); });
  test('TC-LIFE-016 — Mark Paid side-effects', async () => { await runCase(api, 'TC-LIFE-016'); });
  test('TC-LIFE-017 — Mark Paid non-regular', async () => { await runCase(api, 'TC-LIFE-017'); });
  test('TC-LIFE-018 — Cancel with reason', async () => { await runCase(api, 'TC-LIFE-018'); });
  test('TC-LIFE-019 — Immutable audit per transition', async () => { await runCase(api, 'TC-LIFE-019'); });
  test('TC-LIFE-020 — Edit blocked after processing', async () => { await runCase(api, 'TC-LIFE-020'); });
});
