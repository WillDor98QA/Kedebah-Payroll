/**
 * tax-and-statutory.cases.spec.ts — PERMANENT automation asset (1:1 with test-cases/Tax/tax-and-statutory.md).
 * One named test per documented TC-ID (27 cases). Each dispatches through
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

test.describe('Tax · tax-and-statutory (27 cases)', () => {
  test('TC-TAX-001 — Seed verification — PAYE bands', async () => { await runCase(api, 'TC-TAX-001'); });
  test('TC-TAX-002 — Seed — Tier 1/2/3', async () => { await runCase(api, 'TC-TAX-002'); });
  test('TC-TAX-003 — Seed — bonus/overtime/casual/pension', async () => { await runCase(api, 'TC-TAX-003'); });
  test('TC-TAX-004 — Configure statutory item fields', async () => { await runCase(api, 'TC-TAX-004'); });
  test('TC-TAX-005 — Rate version dating', async () => { await runCase(api, 'TC-TAX-005'); });
  test('TC-TAX-006 — Calc uses dated rate', async () => { await runCase(api, 'TC-TAX-006'); });
  test('TC-TAX-007 — Resolver — mandatory floor', async () => { await runCase(api, 'TC-TAX-007'); });
  test('TC-TAX-008 — Resolver — auto-enroll match', async () => { await runCase(api, 'TC-TAX-008'); });
  test('TC-TAX-009 — Resolver — explicit exempt subtracts', async () => { await runCase(api, 'TC-TAX-009'); });
  test('TC-TAX-010 — No income-tax engine → hard block', async () => { await runCase(api, 'TC-TAX-010'); });
  test('TC-TAX-011 — Eligibility OR combination', async () => { await runCase(api, 'TC-TAX-011'); });
  test('TC-TAX-012 — Eligibility scope negative', async () => { await runCase(api, 'TC-TAX-012'); });
  test('TC-TAX-013 — Tax preset one-click', async () => { await runCase(api, 'TC-TAX-013'); });
  test('TC-TAX-014 — Per-employee rate override', async () => { await runCase(api, 'TC-TAX-014'); });
  test('TC-TAX-015 — Voluntary Tier 3 scheme', async () => { await runCase(api, 'TC-TAX-015'); });
  test('TC-TAX-016 — Exemption requires reason', async () => { await runCase(api, 'TC-TAX-016'); });
  test('TC-TAX-017 — Filing-rule due dates', async () => { await runCase(api, 'TC-TAX-017'); });
  test('TC-TAX-018 — Statutory config permission', async () => { await runCase(api, 'TC-TAX-018'); });
  test('TC-TAX-019 — Negative: invalid band overlap', async () => { await runCase(api, 'TC-TAX-019'); });
  test('TC-RELF-001 — Fixed Annual ÷ 12', async () => { await runCase(api, 'TC-RELF-001'); });
  test('TC-RELF-002 — Per-Unit annual × units ÷ 12', async () => { await runCase(api, 'TC-RELF-002'); });
  test('TC-RELF-003 — Per-Unit cap at max units', async () => { await runCase(api, 'TC-RELF-003'); });
  test('TC-RELF-004 — % assessable income', async () => { await runCase(api, 'TC-RELF-004'); });
  test('TC-RELF-005 — SSF auto from Tier1+Tier2 EE', async () => { await runCase(api, 'TC-RELF-005'); });
  test('TC-RELF-006 — Reliefs run first', async () => { await runCase(api, 'TC-RELF-006'); });
  test('TC-RELF-007 — Per-employee assignment', async () => { await runCase(api, 'TC-RELF-007'); });
  test('TC-RELF-008 — Boundary: relief > base', async () => { await runCase(api, 'TC-RELF-008'); });
});
