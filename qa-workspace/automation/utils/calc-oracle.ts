/**
 * calc-oracle.ts — Independent re-implementation of Kedebah Payroll's statutory math,
 * derived ONLY from the PRD (PAYROLL_COMPLETE_SYSTEM_GUIDE.md). This is the comparison oracle:
 * tests assert the engine's stored snapshot == oracle output to the cent.
 *
 * PRD references are cited per function. Ghana monthly figures from §10 / §17 / §24.
 *
 * ⚠️ The default GHANA_PAYE_BANDS etc. encode the PRD's *documented* seed values. Before relying on
 * them, TC-TAX-001…003 must confirm the live seed matches (Test Plan entry criteria). If the live
 * seed differs, construct the oracle from the fetched statutory config instead of these constants.
 */

import { round } from './money.js';

// ─────────────────────────────────────────────────────────────────────────────
// PAYE — Progressive Bands (monthly). PRD §10, §24.
// ─────────────────────────────────────────────────────────────────────────────

export interface PayeBand {
  /** Upper bound of this band (inclusive). Use Infinity for the top band. */
  upTo: number;
  /** Marginal rate applied to the slice of income within this band. */
  rate: number;
}

/** Ghana monthly PAYE bands (PRD §24). Slice-based cumulative marginal. */
export const GHANA_PAYE_BANDS: readonly PayeBand[] = [
  { upTo: 490, rate: 0 },
  { upTo: 600, rate: 0.05 },
  { upTo: 730, rate: 0.1 },
  { upTo: 3896.67, rate: 0.175 },
  { upTo: 19896.67, rate: 0.25 },
  { upTo: 50416.67, rate: 0.3 },
  { upTo: Infinity, rate: 0.35 },
];

/**
 * Progressive PAYE on chargeable income (PRD §10, §14 step 9h, §17 marginal method).
 * Returns the cumulative tax = Σ (slice within band × band rate).
 */
export function paye(chargeableIncome: number, bands: readonly PayeBand[] = GHANA_PAYE_BANDS): number {
  if (chargeableIncome <= 0) return 0;
  let tax = 0;
  let lower = 0;
  for (const band of bands) {
    if (chargeableIncome <= lower) break;
    const sliceTop = Math.min(chargeableIncome, band.upTo);
    const slice = Math.max(0, sliceTop - lower);
    tax += slice * band.rate;
    lower = band.upTo;
  }
  return round(tax);
}

/**
 * Marginal tax on an `excess` amount stacked on a `reference` chargeable income.
 * PRD §17: bonus/overtime excess = tax(reference + excess) − tax(reference).
 */
export function marginalTax(reference: number, excess: number, bands = GHANA_PAYE_BANDS): number {
  return round(paye(reference + excess, bands) - paye(reference, bands));
}

// ─────────────────────────────────────────────────────────────────────────────
// Tier 1 / 2 / 3 — Percentage Split on basic salary. PRD §10, §24.
// ─────────────────────────────────────────────────────────────────────────────

export interface PercentageSplit {
  employee: number; // fraction, e.g. 0.055
  employer: number; // fraction, e.g. 0.13
}

export const GHANA_TIER1: PercentageSplit = { employee: 0.055, employer: 0.13 };
export const GHANA_TIER2: PercentageSplit = { employee: 0.0, employer: 0.05 };

export function tierContribution(basic: number, split: PercentageSplit) {
  return {
    employee: round(basic * split.employee),
    employer: round(basic * split.employer),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Tax Reliefs — PRD §11. Reliefs run FIRST and trim the PAYE base (§14 step 9a).
// ─────────────────────────────────────────────────────────────────────────────

export type Relief =
  | { type: 'fixedAnnual'; annual: number }
  | { type: 'perUnitAnnual'; annualPerUnit: number; units: number; maxUnits: number }
  | { type: 'percentAssessable'; percent: number } // fraction
  | { type: 'ssf'; tier1Employee: number; tier2Employee: number };

/** Monthly relief value for a single relief (PRD §11 table). */
export function reliefMonthly(relief: Relief, assessableIncome = 0): number {
  switch (relief.type) {
    case 'fixedAnnual':
      return round(relief.annual / 12);
    case 'perUnitAnnual':
      return round((relief.annualPerUnit * Math.min(relief.units, relief.maxUnits)) / 12);
    case 'percentAssessable':
      return round(relief.percent * assessableIncome);
    case 'ssf':
      return round(relief.tier1Employee + relief.tier2Employee);
  }
}

export function totalReliefs(reliefs: Relief[], assessableIncome = 0): number {
  return round(reliefs.reduce((a, r) => a + reliefMonthly(r, assessableIncome), 0));
}

// ─────────────────────────────────────────────────────────────────────────────
// BIK — value = fixed OR rate% × base, capped at monthly cap. PRD §8.
// ─────────────────────────────────────────────────────────────────────────────

export interface BikInput {
  fixedAmount?: number;
  ratePercent?: number; // fraction
  base?: number; // chosen base value (Basic / Cash Emoluments / Qualifying income)
  monthlyCap?: number;
}

export function bikValue(b: BikInput): { computed: number; applied: number; capped: boolean } {
  const computed = round(b.fixedAmount ?? (b.ratePercent ?? 0) * (b.base ?? 0));
  if (b.monthlyCap != null && computed > b.monthlyCap) {
    return { computed, applied: round(b.monthlyCap), capped: true };
  }
  return { computed, applied: computed, capped: false };
}

// ─────────────────────────────────────────────────────────────────────────────
// Bonus Tax — PRD §17.1. 5% final within 15%-of-annual-basic cap; excess marginal.
// ─────────────────────────────────────────────────────────────────────────────

export interface BonusInput {
  monthlyBasic: number;
  bonusThisRun: number;
  ytdBonusBeforeThisRun: number; // cumulative within the year, before this run
  referenceChargeableIncome: number; // synthetic regular-run chargeable income (§17.4)
  bands?: readonly PayeBand[];
}

export interface BonusResult {
  annualCap: number;
  withinCapAmount: number;
  excessAmount: number;
  finalTax5pct: number; // on within-cap portion
  marginalTaxOnExcess: number; // on excess via §17.3
  totalBonusTax: number;
  thresholdBreached: boolean; // raises bonus_threshold_breach (REQ-STAX-007)
}

export function bonusTax(input: BonusInput): BonusResult {
  const annualCap = round(0.15 * (12 * input.monthlyBasic)); // §17.1
  const remainingCap = Math.max(0, annualCap - input.ytdBonusBeforeThisRun);
  const withinCapAmount = round(Math.min(input.bonusThisRun, remainingCap));
  const excessAmount = round(input.bonusThisRun - withinCapAmount);

  const finalTax5pct = round(0.05 * withinCapAmount); // §17.2
  const marginalTaxOnExcess =
    excessAmount > 0
      ? marginalTax(input.referenceChargeableIncome, excessAmount, input.bands ?? GHANA_PAYE_BANDS)
      : 0; // §17.3

  return {
    annualCap,
    withinCapAmount,
    excessAmount,
    finalTax5pct,
    marginalTaxOnExcess,
    totalBonusTax: round(finalTax5pct + marginalTaxOnExcess),
    thresholdBreached: excessAmount > 0,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Overtime Tax — PRD §17.2. Junior split (5%/10%) vs senior marginal.
// ─────────────────────────────────────────────────────────────────────────────

export const OVERTIME_JUNIOR_YTD_THRESHOLD = 18000; // GH₵ qualifying YTD (§24)

export interface OvertimeInput {
  monthlyBasic: number;
  overtimeAmount: number;
  qualifyingYtd: number; // determines junior vs senior
  referenceChargeableIncome?: number; // for senior marginal
  juniorLowRate?: number; // default 0.05
  juniorHighRate?: number; // default 0.10
  bands?: readonly PayeBand[];
}

export interface OvertimeResult {
  isJunior: boolean;
  lowPortion: number;
  highPortion: number;
  tax: number;
  routedToPaye: boolean; // senior → added to chargeable income
}

export function overtimeTax(input: OvertimeInput): OvertimeResult {
  const isJunior = input.qualifyingYtd <= OVERTIME_JUNIOR_YTD_THRESHOLD; // §17.2
  if (isJunior) {
    const lowCap = round(0.5 * input.monthlyBasic); // 50% of monthly basic
    const lowPortion = round(Math.min(input.overtimeAmount, lowCap));
    const highPortion = round(Math.max(0, input.overtimeAmount - lowCap));
    const tax = round((input.juniorLowRate ?? 0.05) * lowPortion + (input.juniorHighRate ?? 0.1) * highPortion);
    return { isJunior, lowPortion, highPortion, tax, routedToPaye: false };
  }
  // Senior: overtime added to chargeable income, taxed at PAYE marginal (§17.2).
  const tax = marginalTax(input.referenceChargeableIncome ?? 0, input.overtimeAmount, input.bands ?? GHANA_PAYE_BANDS);
  return { isJunior, lowPortion: 0, highPortion: 0, tax, routedToPaye: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// Pension Excess — PRD §17.3. Excess over 35% of qualifying income routed to PAYE.
// ─────────────────────────────────────────────────────────────────────────────

export const PENSION_CAP_FRACTION = 0.35; // §24

export function pensionExcess(totalCountingPension: number, qualifyingIncome: number): number {
  const cap = round(PENSION_CAP_FRACTION * qualifyingIncome);
  return round(Math.max(0, totalCountingPension - cap));
}

// ─────────────────────────────────────────────────────────────────────────────
// Net pay & employer cost — PRD §14 steps 12–13.
// ─────────────────────────────────────────────────────────────────────────────

export function netPay(gross: number, totalDeductions: number, employeeStatutory: number): number {
  return round(gross - totalDeductions - employeeStatutory);
}

export function employerCost(gross: number, employerStatutory: number, employerOnlyBenefits = 0): number {
  return round(gross + employerStatutory + employerOnlyBenefits);
}
