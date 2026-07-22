/**
 * benefits-earnings-and-bik.cases.spec.ts — PERMANENT automation asset (1:1 with test-cases/Benefits/benefits-earnings-and-bik.md).
 * One named test per documented TC-ID (32 cases). Each dispatches through
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

test.describe('Benefits · benefits-earnings-and-bik (32 cases)', () => {
  test('TC-BEN-001 — Create earning item', async () => { await runCase(api, 'TC-BEN-001'); });
  test('TC-BEN-002 — Create benefit item', async () => { await runCase(api, 'TC-BEN-002'); });
  test('TC-BEN-003 — Earning → gross', async () => { await runCase(api, 'TC-BEN-003'); });
  test('TC-BEN-004 — Benefit → pay, grouped as benefit', async () => { await runCase(api, 'TC-BEN-004'); });
  test('TC-BEN-005 — Calc: Fixed amount', async () => { await runCase(api, 'TC-BEN-005'); });
  test('TC-BEN-006 — Calc: % of Basic', async () => { await runCase(api, 'TC-BEN-006'); });
  test('TC-BEN-007 — Calc: % of Cash Emoluments', async () => { await runCase(api, 'TC-BEN-007'); });
  test('TC-BEN-008 — Taxable benefit → PAYE base', async () => { await runCase(api, 'TC-BEN-008'); });
  test('TC-BEN-009 — Non-taxable benefit excluded from base', async () => { await runCase(api, 'TC-BEN-009'); });
  test('TC-BEN-010 — Effective window (catalog)', async () => { await runCase(api, 'TC-BEN-010'); });
  test('TC-BEN-011 — Inactive item skipped', async () => { await runCase(api, 'TC-BEN-011'); });
  test('TC-BEN-012 — Alert threshold breach', async () => { await runCase(api, 'TC-BEN-012'); });
  test('TC-BEN-013 — Scope to department', async () => { await runCase(api, 'TC-BEN-013'); });
  test('TC-BEN-014 — Per-employee override window', async () => { await runCase(api, 'TC-BEN-014'); });
  test('TC-BEN-015 — Catalog approval workflow', async () => { await runCase(api, 'TC-BEN-015'); });
  test('TC-BEN-016 — Permission gating', async () => { await runCase(api, 'TC-BEN-016'); });
  test('TC-BIK-001 — BIK = Non-Cash benefit', async () => { await runCase(api, 'TC-BIK-001'); });
  test('TC-BIK-002 — Value = fixed', async () => { await runCase(api, 'TC-BIK-002'); });
  test('TC-BIK-003 — Value = rate% × base', async () => { await runCase(api, 'TC-BIK-003'); });
  test('TC-BIK-004 — Base = Basic', async () => { await runCase(api, 'TC-BIK-004'); });
  test('TC-BIK-005 — Base = Cash Emoluments excl BIK', async () => { await runCase(api, 'TC-BIK-005'); });
  test('TC-BIK-006 — Base = Cash Emoluments incl BIK', async () => { await runCase(api, 'TC-BIK-006'); });
  test('TC-BIK-007 — Base = Qualifying Employment Income', async () => { await runCase(api, 'TC-BIK-007'); });
  test('TC-BIK-008 — Monthly cap bites', async () => { await runCase(api, 'TC-BIK-008'); });
  test('TC-BIK-009 — Cap warning', async () => { await runCase(api, 'TC-BIK-009'); });
  test('TC-BIK-010 — Cap does not bite', async () => { await runCase(api, 'TC-BIK-010'); });
  test('TC-BIK-011 — Taxable BIK not paid', async () => { await runCase(api, 'TC-BIK-011'); });
  test('TC-BIK-012 — BIK excluded from payslip earnings', async () => { await runCase(api, 'TC-BIK-012'); });
  test('TC-BIK-013 — Country-scoped BIK match', async () => { await runCase(api, 'TC-BIK-013'); });
  test('TC-BIK-014 — Auto-enrolled BIK no per-employee row', async () => { await runCase(api, 'TC-BIK-014'); });
  test('TC-BIK-015 — Pipeline position before % items', async () => { await runCase(api, 'TC-BIK-015'); });
  test('TC-BIK-016 — Value re-derived via oracle', async () => { await runCase(api, 'TC-BIK-016'); });
});
