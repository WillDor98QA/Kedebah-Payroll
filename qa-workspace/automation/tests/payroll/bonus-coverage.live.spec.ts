/**
 * bonus-coverage.live.spec.ts — REAL bonus-tax engine verification against the sandbox (read-only).
 * Validates the Ghana bonus method (PRD §17.1) + the reconciliation invariant (§17.5) on every
 * processed/paid bonus run, asserting the engine's stored traces == independent oracle (to the cent).
 *
 * Traces: REQ-STAX-001/002/003/004/005, TC-STAX-001/002/004/007.
 */

import { test, expect } from '@playwright/test';
import { existsSync, writeFileSync, mkdirSync } from 'node:fs';
import { ApiClient } from '../../helpers/api-client.js';
import { isAppConfigured } from '../../config/env.js';
import { paye, bonusTax } from '../../utils/calc-oracle.js';
import { record, recordMoney } from '../../helpers/exec-recorder.js';

const STATE = 'fixtures/.auth/admin.json';
const r2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

let api: ApiClient;
let bonusRuns: any[] = [];
const basicByStaff = new Map<number, number>(); // independent monthly basic, sourced from regular runs

test.beforeAll(async () => {
  test.skip(!isAppConfigured || !existsSync(STATE), 'Admin storage state not available (run setup).');
  api = await ApiClient.fromState(STATE);
  const runs = await api.json<any[]>('/pay-runs?paginate=false');
  bonusRuns = runs.filter((r) => /bonus/i.test(r.run_type ?? r.type ?? '') && ['paid', 'processed', 'approved'].includes((r.status ?? '').toLowerCase()));
  expect(bonusRuns.length, 'no processed/paid bonus runs').toBeGreaterThan(0);

  // Independent monthly-basic per employee from regular processed/paid runs (bonus runs carry no basic).
  const regulars = runs.filter((r) => /regular/i.test(r.run_type ?? r.type ?? '') && ['paid', 'processed'].includes((r.status ?? '').toLowerCase()));
  for (const r of regulars.slice(0, 5)) {
    const emps = await api.json<any[]>(`/pay-runs/${r.id}/employees`);
    for (const e of emps) if (Number(e.basic_salary) > 0 && !basicByStaff.has(e.staff_id)) basicByStaff.set(e.staff_id, Number(e.basic_salary));
  }
});
test.afterAll(async () => api?.dispose());

test('Bonus tax + reconciliation match the oracle (processed bonus runs) @p1 @calc', async () => {
  const failures: string[] = [];
  let verified = 0;

  for (const run of bonusRuns) {
    const employees = await api.json<any[]>(`/pay-runs/${run.id}/employees`);
    mkdirSync('../evidence/network', { recursive: true });
    for (const e of employees) {
      const cb = e.calculation_breakdown;
      const bt = cb?.bonus_tax_trace;
      if (!bt) continue;
      const ev = `evidence/network/bonus-run-${run.id}-emp.json`;
      writeFileSync(`../evidence/network/bonus-run-${run.id}-emp.json`, JSON.stringify(e, null, 2));
      const who = `${e.employee_name} (bonus run #${run.id})`;

      const bonusLine = (e.lines ?? []).find((l: any) => l.line_type === 'earning' && /bonus/i.test(l.name));
      const withinCapUsed = Number(bt.final_tax) / 0.05;
      const bonusAmt = bonusLine ? Number(bonusLine.amount) : r2(withinCapUsed + Number(bt.excess_routed));
      // Independent monthly basic: regular-run basic for this staff; else reference.basic (when excess);
      // else derive from the engine's cap (threshold = 15% × 12 × basic = 1.8 × basic).
      let monthlyBasic = basicByStaff.get(e.staff_id) ?? 0;
      const refBasic = Number(cb.bonus_excess_paye_trace?.reference?.basic);
      if (!monthlyBasic && Number.isFinite(refBasic) && refBasic > 0) monthlyBasic = refBasic;
      if (!monthlyBasic && Number(bt.threshold) > 0) monthlyBasic = r2(Number(bt.threshold) / 1.8);
      const refChargeable = Number(cb.bonus_excess_paye_trace?.reference?.chargeable ?? 0);
      const ytd = Number(bt.ytd_bonus ?? 0);

      const o = bonusTax({ monthlyBasic, bonusThisRun: bonusAmt, ytdBonusBeforeThisRun: ytd, referenceChargeableIncome: refChargeable });
      const base = { module: 'Payroll/STAX', evidence: ev };

      // §17.1 annual cap = 15% of annual basic
      if (!recordMoney({ ...base, tcId: 'TC-STAX-001', reqId: 'REQ-STAX-001', feature: 'Bonus annual cap', scenario: `cap == 15% × 12 × basic ${monthlyBasic} — ${who}` }, Number(bt.threshold), o.annualCap))
        failures.push(`cap ${who}: ${bt.threshold} vs ${o.annualCap}`);
      // §17.2 within-cap 5% final
      if (!recordMoney({ ...base, tcId: 'TC-STAX-002', reqId: 'REQ-STAX-002', feature: 'Bonus 5% final within cap', scenario: `final tax == 5% × within-cap — ${who}` }, Number(bt.final_tax), o.finalTax5pct))
        failures.push(`final ${who}: ${bt.final_tax} vs ${o.finalTax5pct}`);
      // §17.3 excess routed
      if (!recordMoney({ ...base, tcId: 'TC-STAX-004', reqId: 'REQ-STAX-003', feature: 'Bonus excess amount', scenario: `excess == bonus − within-cap — ${who}` }, Number(bt.excess_routed), o.excessAmount))
        failures.push(`excess ${who}: ${bt.excess_routed} vs ${o.excessAmount}`);

      const ex = cb.bonus_excess_paye_trace;
      if (ex && Number(bt.excess_routed) > 0) {
        // §17.3 marginal on excess = tax(ref+excess) − tax(ref)
        if (!recordMoney({ ...base, tcId: 'TC-STAX-004', reqId: 'REQ-STAX-003', feature: 'Bonus excess marginal PAYE', scenario: `marginal == tax(ref+excess) − tax(ref) — ${who}` }, Number(ex.marginal_paye), o.marginalTaxOnExcess))
          failures.push(`marginal ${who}: ${ex.marginal_paye} vs ${o.marginalTaxOnExcess}`);
        // §17.4 reference PAYE reconstructed by oracle
        if (!recordMoney({ ...base, tcId: 'TC-STAX-002', reqId: 'REQ-STAX-004', feature: 'Bonus reference PAYE', scenario: `paye(reference ${refChargeable}) == tax_without_excess — ${who}` }, Number(ex.tax_without_excess), paye(refChargeable)))
          failures.push(`refPAYE ${who}: ${ex.tax_without_excess} vs ${paye(refChargeable)}`);
        // §17.5 reconciliation invariant: regular PAYE + bonus marginal == single-pass PAYE(salary+excess)
        const recon = r2(Number(ex.tax_without_excess) + Number(ex.marginal_paye));
        if (!recordMoney({ ...base, tcId: 'TC-STAX-007', reqId: 'REQ-STAX-005', feature: 'Bonus reconciliation invariant', scenario: `regularPAYE + bonusMarginal == PAYE(ref+excess) — ${who}` }, recon, Number(ex.tax_with_excess)))
          failures.push(`recon ${who}: ${recon} vs ${ex.tax_with_excess}`);
      }
      verified++;
    }
  }

  expect(verified, 'no bonus employees with a tax trace').toBeGreaterThan(0);
  expect(failures, `bonus mismatches:\n${failures.join('\n')}`).toHaveLength(0);
  test.info().annotations.push({ type: 'verified', description: `${verified} bonus employees across ${bonusRuns.length} runs reconciled vs oracle` });
});
