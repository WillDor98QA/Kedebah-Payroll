/**
 * seed-and-paye.live.spec.ts — REAL execution against the sandbox.
 * Traces: TC-TAX-001/002/003 (seed verification, PRD §24) and TC-PAYE-* / TC-CAL-009/012 (engine
 * PAYE == independent oracle, to the cent) using actual processed payroll data.
 *
 * Auth: builds a Sanctum/Bearer + X-Tenant-Id client from the admin storage state produced by the
 * `setup` project (login → select business). Self-skips if state/app not available.
 */

import { test, expect } from '@playwright/test';
import { existsSync } from 'node:fs';
import { ApiClient } from '../../helpers/api-client.js';
import { isAppConfigured, env } from '../../config/env.js';
import { paye } from '../../utils/calc-oracle.js';

const STATE = 'fixtures/.auth/admin.json';
let api: ApiClient;

test.beforeAll(async () => {
  test.skip(!isAppConfigured || !existsSync(STATE), 'Admin storage state not available (run setup).');
  api = await ApiClient.fromState(STATE);
});
test.afterAll(async () => api?.dispose());

test.describe('Seed verification @p1 @calc (TC-TAX-001..003, PRD §24)', () => {
  test('all documented statutory engines are present', async () => {
    const items = await api.json<any[]>(`/statutory-items?paginate=false&country_id=${env.countryId}`);
    const engines = new Set(items.map((i) => i.engine_key ?? i.engine));
    for (const e of ['progressive_bands', 'percentage_split', 'bonus_tax', 'overtime_junior', 'flat_rate', 'pension_excess']) {
      expect(engines, `missing documented engine ${e}`).toContain(e);
    }
    // PAYE on qualifying employment income; Tier 1/2/3 on basic salary (PRD §10).
    const payeItem = items.find((i) => /paye|income/i.test(`${i.name} ${i.code}`));
    expect(payeItem?.base_amount_type ?? payeItem?.base).toBe('qualifying_employment_income');
  });
});

test.describe('PAYE engine == oracle @p1 @calc (TC-PAYE/TC-CAL, live processed payroll)', () => {
  test('every processed employee PAYE matches the oracle to the cent', async () => {
    const runs = await api.json<any[]>('/pay-runs?paginate=false');
    const run = runs.find((r) => ['paid', 'processed'].includes((r.status ?? '').toLowerCase()));
    expect(run, 'no processed/paid run to verify against').toBeTruthy();

    const employees = await api.json<any[]>(`/pay-runs/${run.id}/employees`);
    const withCalc = employees.filter((e) => e?.calculation_breakdown?.paye != null && e?.calculation_breakdown?.chargeable_income != null);
    expect(withCalc.length, 'no employees with a PAYE breakdown').toBeGreaterThan(0);

    const mismatches: string[] = [];
    for (const e of withCalc) {
      const cb = e.calculation_breakdown;
      const expected = paye(Number(cb.chargeable_income));
      const actual = Number(cb.paye);
      if (Math.abs(expected - actual) > 0.01) {
        mismatches.push(`${e.employee_name}: chargeable=${cb.chargeable_income} engine=${actual} oracle=${expected}`);
      }
    }
    expect(mismatches, `PAYE mismatches:\n${mismatches.join('\n')}`).toHaveLength(0);
    test.info().annotations.push({ type: 'verified', description: `${withCalc.length} employees PAYE == oracle (run #${run.id})` });
  });
});
