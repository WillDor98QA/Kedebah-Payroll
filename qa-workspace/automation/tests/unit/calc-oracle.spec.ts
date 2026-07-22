/**
 * calc-oracle.spec.ts — UNIT tests for the calculation oracle. PRD §10, §11, §17, §24.
 * Runs with NO app and NO browser (Playwright "unit" project) — this is runnable RIGHT NOW.
 * It proves the oracle (which all calculation tests compare the engine against) is itself correct.
 *
 * Run:  npx playwright test tests/unit   (or  npm run test:oracle)
 */

import { test, expect } from '@playwright/test';
import {
  paye,
  marginalTax,
  tierContribution,
  GHANA_TIER1,
  GHANA_TIER2,
  reliefMonthly,
  bikValue,
  bonusTax,
  overtimeTax,
  pensionExcess,
  netPay,
  employerCost,
} from '../../utils/calc-oracle.js';
import { shiftWeekendPayDateToFriday, computePayDate, endOfMonth } from '../../utils/date-helpers.js';

test.describe('PAYE progressive bands @calc (PRD §10/§24)', () => {
  // Cumulative marginal tax at each band ceiling (independently computed).
  const cases: [number, number][] = [
    [400, 0], // within band 1
    [490, 0], // band-1 ceiling
    [600, 5.5], // band-2 ceiling: 110×5%
    [730, 18.5], // +130×10%
    [3896.67, 572.67], // +3166.67×17.5%
    [19896.67, 4572.67], // +16000×25%
    [50416.67, 13728.67], // +30520×30%
    [60000, 17082.83], // +9583.33×35%
    [5000, 848.5], // mid band 4→5 boundary check
  ];
  for (const [income, expected] of cases) {
    test(`PAYE(${income}) = ${expected}`, () => {
      expect(paye(income)).toBe(expected);
    });
  }

  test('PAYE never negative; zero base → 0 (TC-PAYE-017)', () => {
    expect(paye(0)).toBe(0);
    expect(paye(-100)).toBe(0);
  });

  test('marginal excess method tax(ref+excess)−tax(ref) (PRD §17.3)', () => {
    // ref 5000 (PAYE 848.50), +2000 excess → PAYE(7000)=1348.50 → marginal 500.00
    expect(marginalTax(5000, 2000)).toBe(500);
  });
});

test.describe('Tier 1/2 percentage split @calc (PRD §10/§24)', () => {
  test('Tier 1 on basic 5000 → EE 275, ER 650', () => {
    expect(tierContribution(5000, GHANA_TIER1)).toEqual({ employee: 275, employer: 650 });
  });
  test('Tier 2 on basic 5000 → EE 0, ER 250', () => {
    expect(tierContribution(5000, GHANA_TIER2)).toEqual({ employee: 0, employer: 250 });
  });
});

test.describe('Tax reliefs @calc (PRD §11)', () => {
  test('Fixed Annual 1200/yr → 100/mo (TC-RELF-001)', () => {
    expect(reliefMonthly({ type: 'fixedAnnual', annual: 1200 })).toBe(100);
  });
  test('Per-unit capped at max units (TC-RELF-003)', () => {
    expect(reliefMonthly({ type: 'perUnitAnnual', annualPerUnit: 600, units: 5, maxUnits: 3 })).toBe(150);
  });
  test('Percent of assessable 25% of 2000 → 500 (TC-RELF-004)', () => {
    expect(reliefMonthly({ type: 'percentAssessable', percent: 0.25 }, 2000)).toBe(500);
  });
  test('SSF = Tier1+Tier2 EE (TC-RELF-005)', () => {
    expect(reliefMonthly({ type: 'ssf', tier1Employee: 275, tier2Employee: 0 })).toBe(275);
  });
});

test.describe('BIK valuation @calc (PRD §8)', () => {
  test('rate × base capped (TC-BIK-008/009)', () => {
    expect(bikValue({ ratePercent: 0.05, base: 8000, monthlyCap: 300 })).toEqual({
      computed: 400,
      applied: 300,
      capped: true,
    });
  });
  test('fixed value, no cap bite (TC-BIK-002/010)', () => {
    expect(bikValue({ fixedAmount: 250, monthlyCap: 300 })).toEqual({ computed: 250, applied: 250, capped: false });
  });
});

test.describe('Bonus tax @calc (PRD §17.1)', () => {
  test('within+excess split with marginal (TC-STAX-004)', () => {
    const r = bonusTax({ monthlyBasic: 5000, bonusThisRun: 3000, ytdBonusBeforeThisRun: 8000, referenceChargeableIncome: 5000 });
    expect(r.annualCap).toBe(9000);
    expect(r.withinCapAmount).toBe(1000);
    expect(r.excessAmount).toBe(2000);
    expect(r.finalTax5pct).toBe(50);
    expect(r.marginalTaxOnExcess).toBe(500);
    expect(r.totalBonusTax).toBe(550);
    expect(r.thresholdBreached).toBe(true);
  });
});

test.describe('Overtime tax @calc (PRD §17.2)', () => {
  test('junior 5%/10% split (TC-STAX-013)', () => {
    const r = overtimeTax({ monthlyBasic: 4000, overtimeAmount: 3000, qualifyingYtd: 10000 });
    expect(r.isJunior).toBe(true);
    expect(r.lowPortion).toBe(2000);
    expect(r.highPortion).toBe(1000);
    expect(r.tax).toBe(200);
    expect(r.routedToPaye).toBe(false);
  });
  test('senior marginal (TC-STAX-014)', () => {
    const r = overtimeTax({ monthlyBasic: 4000, overtimeAmount: 2000, qualifyingYtd: 25000, referenceChargeableIncome: 25000 });
    expect(r.isJunior).toBe(false);
    expect(r.routedToPaye).toBe(true);
    expect(r.tax).toBe(600); // PAYE(27000)−PAYE(25000)
  });
});

test.describe('Pension excess & totals @calc (PRD §17.3/§14)', () => {
  test('excess over 35% cap (TC-STAX-020)', () => {
    expect(pensionExcess(4000, 10000)).toBe(500); // cap 3500
  });
  test('net pay & employer cost (TC-CAL-016/018)', () => {
    expect(netPay(10000, 1500, 800)).toBe(7700);
    expect(employerCost(10000, 900, 200)).toBe(11100);
  });
});

test.describe('Pay-calendar date math @calc (PRD §4)', () => {
  test('Sunday 31 May 2026 pay date → Friday 29 May (TC-CYCLE-012)', () => {
    const shifted = shiftWeekendPayDateToFriday(new Date(2026, 4, 31));
    expect(shifted.getFullYear()).toBe(2026);
    expect(shifted.getMonth()).toBe(4);
    expect(shifted.getDate()).toBe(29);
  });
  test('offset 0 pays on period end when weekday', () => {
    const pd = computePayDate(new Date(2026, 5, 30), 0); // Tue 30 Jun 2026
    expect(pd.getDate()).toBe(30);
  });
  test('month-end snap incl. leap Feb 2028', () => {
    expect(endOfMonth(new Date(2028, 1, 10)).getDate()).toBe(29);
  });
});
