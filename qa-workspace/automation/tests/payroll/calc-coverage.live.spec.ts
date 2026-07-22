/**
 * calc-coverage.live.spec.ts — REAL multi-rule calculation verification against the sandbox.
 * Read-only: reads stored snapshots from the latest REGULAR processed/paid run and asserts each
 * money rule == independent oracle (to the cent). One Playwright test emits one execution record
 * per business rule per employee (enterprise Test Execution Report).
 *
 * Traces: REQ-PAYE-008/009, REQ-CAL-007/012/013, REQ-TAX-002, REQ-RELF-004/005, REQ-BIK-006,
 *         TC-PAYE-012/014, TC-CAL-011/016/018, TC-TAX-002, TC-RELF-005, TC-BIK-011.
 */

import { test, expect } from '@playwright/test';
import { existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { ApiClient } from '../../helpers/api-client.js';
import { isAppConfigured } from '../../config/env.js';
import { paye, tierContribution, GHANA_TIER1, GHANA_TIER2, netPay, employerCost } from '../../utils/calc-oracle.js';
import { record, recordMoney } from '../../helpers/exec-recorder.js';

const STATE = 'fixtures/.auth/admin.json';
const r2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const lineAmt = (emp: any, code: string, field: 'amount' | 'employer_amount' = 'amount') =>
  Number(emp.lines?.find((l: any) => l.code === code)?.[field] ?? 0);

let api: ApiClient;
let run: any;
let employees: any[] = [];

test.beforeAll(async () => {
  test.skip(!isAppConfigured || !existsSync(STATE), 'Admin storage state not available (run setup).');
  api = await ApiClient.fromState(STATE);
  const runs = await api.json<any[]>('/pay-runs?paginate=false');
  run = runs.find((x) => /regular/i.test(x.run_type ?? x.type ?? '') && ['paid', 'processed'].includes((x.status ?? '').toLowerCase()));
  expect(run, 'no regular processed/paid run found').toBeTruthy();
  employees = await api.json<any[]>(`/pay-runs/${run.id}/employees`);
  mkdirSync('../evidence/network', { recursive: true });
  writeFileSync(`../evidence/network/run-${run.id}-employees-full.json`, JSON.stringify(employees, null, 2));
});
test.afterAll(async () => api?.dispose());

test('Recurring-run calculation rules match the oracle (per employee) @p1 @calc', async () => {
  const withCalc = employees.filter((e) => e?.calculation_breakdown?.paye != null);
  expect(withCalc.length, 'no employees with a calculation breakdown').toBeGreaterThan(0);

  const failures: string[] = [];
  for (const e of withCalc) {
    const cb = e.calculation_breakdown;
    const who = `${e.employee_name} (run #${run.id})`;
    const ev = `evidence/network/run-${run.id}-employees-full.json`;
    const basic = Number(e.basic_salary);
    const tier1EE = lineAmt(e, 'tier_1');
    const tier2EE = lineAmt(e, 'tier_2');
    const tier3EE = lineAmt(e, 'tier_3'); // voluntary scheme; 0 if not enrolled
    const earnings = (e.lines ?? []).filter((l: any) => l.line_type === 'earning').reduce((a: number, l: any) => a + Number(l.amount), 0);

    const checks: [string, string, string, string, number, number][] = [
      // tcId, reqId, feature, scenario, actual, expected
      ['TC-PAYE-012', 'REQ-PAYE-008', 'PAYE bands', `PAYE == oracle(chargeable ${cb.chargeable_income}) — ${who}`, Number(cb.paye), paye(Number(cb.chargeable_income))],
      // chargeable = qualifying employment income (which already includes ALL BIK: catalog + loan) − reliefs − SSF
      ['TC-PAYE-014', 'REQ-PAYE-009', 'Chargeable base', `chargeable == qualifyingIncome − reliefs − SSF — ${who}`, Number(cb.chargeable_income), r2(Number(cb.qualifying_employment_income) - Number(cb.reliefs_monthly_total) - Number(cb.ssf_employee))],
      ['TC-CAL-007', 'REQ-CAL-007', 'Gross pay (BIK excluded)', `gross == Σ earnings; total BIK ${e.total_bik} excluded — ${who}`, Number(e.gross_pay), r2(earnings)],
      ['TC-CAL-016', 'REQ-CAL-012', 'Net pay', `net == gross − deductions − statutoryEE — ${who}`, Number(e.net_pay), netPay(Number(e.gross_pay), Number(e.total_deductions), Number(e.total_statutory_employee))],
      ['TC-CAL-018', 'REQ-CAL-013', 'Employer cost', `employerCost == gross + statutoryER — ${who}`, Number(e.employer_cost), employerCost(Number(e.gross_pay), Number(e.total_statutory_employer), 0)],
      ['TC-TAX-002', 'REQ-TAX-002', 'Tier 1 employee 5.5%', `Tier1 EE == 5.5% × basic ${basic} — ${who}`, tier1EE, tierContribution(basic, GHANA_TIER1).employee],
      ['TC-TAX-002', 'REQ-TAX-002', 'Tier 2 employer 5%', `Tier2 ER == 5% × basic ${basic} — ${who}`, lineAmt(e, 'tier_2', 'employer_amount'), tierContribution(basic, GHANA_TIER2).employer],
      // engine SSF relief = Tier1+Tier2+Tier3 EE (internal consistency). PRD §11 says T1+T2 only → BUG-003.
      ['TC-RELF-005', 'REQ-RELF-004', 'SSF relief (engine rule)', `SSF == Tier1EE+Tier2EE+Tier3EE — ${who}`, Number(cb.ssf_employee), r2(tier1EE + tier2EE + tier3EE)],
      ['TC-CAL-016', 'REQ-CAL-012', 'Statutory EE total', `statutoryEE == PAYE + Tier1+Tier2+Tier3 EE — ${who}`, Number(e.total_statutory_employee), r2(Number(cb.paye) + tier1EE + tier2EE + tier3EE)],
    ];

    for (const [tcId, reqId, feature, scenario, actual, expected] of checks) {
      const ok = recordMoney({ tcId, reqId, module: 'Payroll/Calc', feature, scenario, evidence: ev }, actual, expected);
      if (!ok) failures.push(`${feature}: ${scenario} → actual ${actual} vs oracle ${expected}`);
    }
  }
  expect(failures, `calculation mismatches:\n${failures.join('\n')}`).toHaveLength(0);
  test.info().annotations.push({ type: 'verified', description: `${withCalc.length} employees × 9 rules vs oracle (run #${run.id})` });
});

// Known discrepancy: PRD §24 documents Tier 1 employer = 13%; the live seed uses 8% (the real Ghana
// Tier-1 split; total employer pension 13% = 8% Tier1 + 5% Tier2). Recorded + raised as BUG-002.
test('Tier 1 employer rate matches PRD §24 (13%) — documented discrepancy @p1 @calc', () => {
  test.fail(true, 'Known discrepancy: live Tier 1 employer = 8%, PRD §24 says 13% (likely PRD doc error). See BUG-002.');
  const e = employees.find((x) => x?.calculation_breakdown?.paye != null);
  const basic = Number(e.basic_salary);
  const actualER = lineAmt(e, 'tier_1', 'employer_amount');
  const expectedER = tierContribution(basic, GHANA_TIER1).employer; // 13% per PRD
  record({
    tcId: 'TC-TAX-002', reqId: 'REQ-TAX-002', module: 'Tax', feature: 'Tier 1 employer rate',
    scenario: `Tier1 ER vs PRD §24 13% × basic ${basic} (${e.employee_name})`,
    expected: expectedER.toFixed(2), actual: actualER.toFixed(2), status: 'FAIL',
    evidence: `evidence/network/run-${run.id}-employees-full.json`, bug: 'BUG-002',
  });
  expect(actualER).toBe(expectedER); // expected-to-fail (test.fail)
});

// Known discrepancy: PRD §11 documents SSF relief = Tier 1 + Tier 2 employee contributions only; the
// live engine also includes Tier 3 (voluntary) EE. Recorded + raised as BUG-003.
test('SSF relief matches PRD §11 (Tier 1 + Tier 2 only) — documented discrepancy @p1 @calc', () => {
  test.fail(true, 'Known discrepancy: live SSF relief includes Tier 3 EE; PRD §11 says Tier 1 + Tier 2 only. See BUG-003.');
  const e = employees.find((x) => Number(x.lines?.find((l: any) => l.code === 'tier_3')?.amount ?? 0) > 0);
  expect(e, 'no Tier-3 employee to demonstrate the discrepancy').toBeTruthy();
  const ssf = Number(e.calculation_breakdown.ssf_employee);
  const t1 = lineAmt(e, 'tier_1');
  const t2 = lineAmt(e, 'tier_2');
  const expectedPrd = r2(t1 + t2); // PRD §11
  record({
    tcId: 'TC-RELF-005', reqId: 'REQ-RELF-004', module: 'Tax/Reliefs', feature: 'SSF relief composition',
    scenario: `SSF vs PRD §11 (Tier1+Tier2 only) — ${e.employee_name} (engine includes Tier3)`,
    expected: expectedPrd.toFixed(2), actual: ssf.toFixed(2), status: 'FAIL',
    evidence: `evidence/network/run-${run.id}-employees-full.json`, bug: 'BUG-003',
  });
  expect(ssf).toBe(expectedPrd); // expected-to-fail (test.fail)
});
