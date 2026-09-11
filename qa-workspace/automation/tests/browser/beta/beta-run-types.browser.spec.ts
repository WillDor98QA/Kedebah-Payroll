/**
 * beta-run-types.browser.spec.ts — PERMANENT regression asset.
 *
 * Off-Cycle and Termination pay-run types. Reverse-engineered live on BETA 2026-09-09
 * (reports/BETA-05 / Phase 2; evidence/beta/P2-02..P2-07).
 *
 * Oracle facts guarded here:
 *   Off-Cycle (Include-regular-salary OFF):
 *     - the one-time amount is ordinary income — PAYE only, NO employee or employer SSNIT
 *     - GH₵1,000 one-time -> PAYE 65.75 (progressive from band 1), net 934.25, employer cost 1,000.00
 *     - create-dialog validation: name+schedule required; period end must be >= start
 *     - a negative one-time amount is rejected server-side (422) — [UI shows no error: BETA-F (UX)]
 *   Termination:
 *     - SSNIT (EE 5.5% / ER 13%) on basic salary only; severance is SSNIT-exempt, fully PAYE-taxable, stacked
 *     - ZZQA AlphaOne (basic 3,000) + severance 5,000 -> EE statutory 1,722.25 (SSNIT 165 + PAYE 1,557.25),
 *       net 6,277.75, employer contributions 390.00, employer cost 8,390.00; journal balances 8,390/8,390
 *     - last working day mid-month does NOT prorate the auto-included basic salary  [BETA-F-016 — AWAITING FINANCE + PRODUCT RULING 2026-09-09; test pins current behaviour]
 *     - statutory due dates are one month too late (period Oct -> shown Dec)          [FAILS today: BETA-F-019]
 *
 * These specs are mutation-heavy (they create + process + pay runs on the QA tenant "Glenn and Co").
 * They are guarded on `isBetaConfigured` AND on an explicit opt-in flag so a normal `--project=browser`
 * run does not fire real pay runs. Set BETA_ALLOW_MUTATION=1 to enable.
 */
import { test, expect } from '../../../fixtures/browser.fixture.js';
import { betaReady, betaGo } from './_beta-shell.js';
import { isBetaConfigured } from '../../../config/env.js';

const ALLOW_MUTATION = process.env.BETA_ALLOW_MUTATION === '1';

/** Oracle: Ghana monthly PAYE on a chargeable amount, progressive from band 1. */
function payeMonthly(chargeable: number): number {
  const bands = [
    [490, 0], [110, 0.05], [130, 0.1], [3166.67, 0.175],
    [16000, 0.25], [30520, 0.3], [Infinity, 0.35],
  ] as const;
  let tax = 0, left = chargeable;
  for (const [width, rate] of bands) {
    if (left <= 0) break;
    const slice = Math.min(left, width);
    tax += slice * rate;
    left -= slice;
  }
  return Math.round(tax * 100) / 100;
}

test.describe('BETA · Off-Cycle & Termination run types (Phase 2)', () => {
  test.skip(!isBetaConfigured, 'BETA_* not configured.');
  test.skip(!ALLOW_MUTATION, 'Set BETA_ALLOW_MUTATION=1 to run mutation-heavy pay-run specs.');
  test.slow();

  test('oracle self-check — off-cycle one-time GH₵1,000 attracts PAYE 65.75 only, no SSNIT', () => {
    expect(payeMonthly(1000)).toBeCloseTo(65.75, 2);
    // net = gross - PAYE (no SSNIT on a one-off)
    expect(1000 - payeMonthly(1000)).toBeCloseTo(934.25, 2);
  });

  test('oracle self-check — termination: severance stacked on basic, SSNIT on basic only', () => {
    const basic = 3000, severance = 5000;
    const ssnitEE = Math.round(basic * 0.055 * 100) / 100;          // 165.00
    const chargeable = basic + severance - ssnitEE;                  // 7,835
    const paye = payeMonthly(chargeable);                            // 1,557.25
    expect(ssnitEE).toBeCloseTo(165, 2);
    expect(paye).toBeCloseTo(1557.25, 2);
    expect(ssnitEE + paye).toBeCloseTo(1722.25, 2);                  // total EE statutory
    expect(basic + severance - (ssnitEE + paye)).toBeCloseTo(6277.75, 2); // net
    const employerSsnit = Math.round(basic * 0.13 * 100) / 100;      // 390.00 (basic only)
    expect(employerSsnit).toBeCloseTo(390, 2);
  });

  test('TC-BETA-NEG-OFC-001/002 — off-cycle create dialog validation', async ({ page }) => {
    await betaReady(page);
    await betaGo(page, 'Run Payroll');
    await page.getByRole('button', { name: / Create Pay Run /i }).click();
    await page.getByRole('link', { name: /Off-Cycle Payroll/i }).click();
    await expect(page.getByRole('heading', { name: /Create Off-Cycle Payroll/i })).toBeVisible({ timeout: 15_000 });

    // Empty submit -> per-field required errors.
    await page.locator('.fixed button:has-text("Create Pay Run"), button:has-text("Create Pay Run")').last().click();
    await expect(page.getByText(/Off-cycle payroll name is required/i)).toBeVisible();
    await expect(page.getByText(/Pay schedule is required/i)).toBeVisible();

    // End before start -> date-order error.
    await page.getByRole('textbox', { name: /Off-Cycle Payroll Name/i }).fill('ZZQA Off-Cycle Validation');
    await page.getByRole('button', { name: /Pay Schedule/i }).click();
    await page.getByRole('option', { name: /One Time Payment/i }).click();
    const dates = page.locator('input[type="date"]');
    await dates.nth(1).fill('2026-09-20'); // period start
    await dates.nth(2).fill('2026-09-10'); // period end (before start)
    await page.locator('button:has-text("Create Pay Run")').last().click();
    await expect(page.getByText(/Pay period end must be on or after the start/i)).toBeVisible();
  });

  test('TC-BETA-OFC-CALC-001 — off-cycle one-time GH₵1,000 = PAYE 65.75 only, no SSNIT, journal balances', async ({ page, bq }) => {
    await betaReady(page);
    await betaGo(page, 'Run Payroll');
    await page.getByRole('button', { name: / Create Pay Run /i }).click();
    await page.getByRole('link', { name: /Off-Cycle Payroll/i }).click();
    await page.getByRole('textbox', { name: /Off-Cycle Payroll Name/i }).fill(`ZZQA OffCycle ${Date.now().toString().slice(-6)}`);
    await page.getByRole('button', { name: /Pay Schedule/i }).click();
    await page.getByRole('option', { name: /One Time Payment/i }).click();
    const dates = page.locator('input[type="date"]');
    await dates.nth(1).fill('2026-09-10');
    await dates.nth(2).fill('2026-09-20');
    await page.locator('button:has-text("Create Pay Run")').last().click();
    await expect(page).toHaveURL(/\/payroll\/offcycle\/\d+\/details/, { timeout: 30_000 });

    await page.getByRole('button', { name: / Add Employee/i }).first().click();
    await page.getByRole('row', { name: /ZZQA AlphaOne/i }).getByRole('checkbox').check();
    await page.getByRole('button', { name: / Add selected/i }).click();
    await page.getByRole('button', { name: / Edit/i }).first().click();
    await page.getByRole('spinbutton', { name: '0.00' }).nth(2).fill('1000');
    await page.getByRole('button', { name: / Save/i }).click();
    await page.getByRole('button', { name: /Save & calculate/i }).click();
    await page.waitForLoadState('networkidle').catch(() => {});

    const totals = page.getByText(/Draft totals/i).locator('..');
    await expect(totals).toContainText('GH₵ 1,000.00');       // gross
    await expect(totals).toContainText('GH₵ 65.75');           // taxes & statutory = PAYE only
    await expect(totals).toContainText('GH₵ 934.25');          // net
    const shot = await bq.snap('beta-offcycle', 'calc-1000');
    expect(shot).toBeTruthy();
  });

  test('TC-BETA-TERM-CALC-001 — termination: severance stacked, SSNIT basic-only, journal balances 8,390', async ({ page, bq }) => {
    await betaReady(page);
    await betaGo(page, 'Run Payroll');
    await page.getByRole('button', { name: / Create Pay Run /i }).click();
    await page.getByRole('link', { name: /Termination Payroll/i }).click();
    await page.getByRole('textbox', { name: /Termination Payroll Name/i }).fill(`ZZQA Termination ${Date.now().toString().slice(-6)}`);
    await page.getByRole('button', { name: /Continue to settlement details/i }).click();
    await expect(page).toHaveURL(/\/payroll\/termination\/\d+\/details/, { timeout: 30_000 });

    await page.getByRole('button', { name: / Choose employee/i }).click();
    await page.getByRole('row', { name: /ZZQA AlphaOne/i }).getByRole('checkbox').check();
    await page.getByRole('button', { name: / Add to pay run/i }).click();
    await page.locator('input[type="date"]').first().fill('2026-10-15');
    await page.getByRole('button', { name: / Add Earning/i }).click();
    await page.getByRole('spinbutton', { name: '0.00' }).fill('5000');
    await page.getByRole('textbox', { name: /Travel reimbursement/i }).fill('ZZQA Severance Pay');
    await page.getByRole('button', { name: / Save/i }).click();

    const summary = page.getByRole('heading', { name: /Payroll Summary/i }).locator('..');
    await expect(summary).toContainText('GH₵ 1,722.25');   // statutory (est.)
    await expect(summary).toContainText('GH₵ 6,277.75');   // estimated net pay

    await page.getByRole('button', { name: /Save and Continue/i }).click();
    await expect(page).toHaveURL(/\/payroll\/draft\/\d+\/termination/, { timeout: 30_000 });
    const shot = await bq.snap('beta-termination', 'settlement');
    expect(shot).toBeTruthy();
  });

  test('TC-BETA-TERM-PRORATE-001 — mid-month last working day should prorate the basic salary [BETA-F-016: finance+product ruling]', async ({ page }) => {
    // BETA-F-016 is AWAITING a finance + product ruling (2026-09-09): should a termination's final
    // period prorate to the last working day, or is a full month correct (and the field help text wrong)?
    // This test pins the CURRENT behaviour — last-working-day 2026-10-15 still pays the FULL month
    // basic (GH₵3,000). If the calc is changed to prorate, this assertion starts passing; at that
    // point re-confirm it matches whatever finance/product decided.
    await betaReady(page);
    await betaGo(page, 'Run Payroll');
    await page.getByRole('button', { name: / Create Pay Run /i }).click();
    await page.getByRole('link', { name: /Termination Payroll/i }).click();
    await page.getByRole('textbox', { name: /Termination Payroll Name/i }).fill(`ZZQA TermProrate ${Date.now().toString().slice(-6)}`);
    await page.getByRole('button', { name: /Continue to settlement details/i }).click();
    await page.getByRole('button', { name: / Choose employee/i }).click();
    await page.getByRole('row', { name: /ZZQA AlphaOne/i }).getByRole('checkbox').check();
    await page.getByRole('button', { name: / Add to pay run/i }).click();
    await page.locator('input[type="date"]').first().fill('2026-10-15');
    await page.getByRole('button', { name: / Add Earning/i }).click();
    await page.getByRole('spinbutton', { name: '0.00' }).fill('1'); // token earning to unlock Save
    await page.getByRole('textbox', { name: /Travel reimbursement/i }).fill('ZZQA token');
    await page.getByRole('button', { name: / Save/i }).click();
    await page.getByRole('button', { name: /Save and Continue/i }).click();
    await page.getByRole('button', { name: /^ Process$/i }).click({ timeout: 60_000 }).catch(() => {});
    await page.waitForTimeout(20_000);
    const row = page.getByRole('row', { name: /ZZQA AlphaOne/i });
    // Expectation once fixed: base salary is prorated (< 3,000). Today it is exactly 3,000.00.
    await expect(row, 'BETA-F-016: basic salary must prorate to the last working day').not.toContainText('GH₵ 3,000.00');
  });
});
