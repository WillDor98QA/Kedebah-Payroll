/**
 * beta-payroll-calc.browser.spec.ts — PERMANENT regression asset.
 *
 * Ghana payroll calculation engine, verified against an independent oracle on the BETA environment
 * 2026-09-08/09 (reports/BETA-03-phase1-lifecycle-and-calc.md, BETA-04-*.md; evidence/beta/22,37,N09b).
 *
 * These are READ-ONLY assertions against the already-Paid September run + the processed October run
 * on "Glenn and Co" — they re-open the runs and check the numbers, they do not create pay runs.
 * The full create→process→approve→pay lifecycle is a separate, mutation-heavy spec (not automated here
 * to keep regression side-effect-free — see BETA-03 for the manual walk-through).
 *
 * SETTLED: employee SSNIT = 5.5%, employer = 13% (Tier 1 EE all; ER 8% Tier1 + 5% Tier2).
 * All 7 PAYE bands verified. Bonus tax: 5% flat under the 15%-of-annual-basic cap, excess stacked on
 * the employee's own marginal band.
 */
import { test, expect } from '../../../fixtures/browser.fixture.js';
import { betaReady, betaGo } from './_beta-shell.js';
import { isBetaConfigured } from '../../../config/env.js';

/** Oracle: Ghana 2026 monthly PAYE on a chargeable amount (resident, 7 bands). */
function payeMonthly(chargeable: number): number {
  const bands: [number, number][] = [
    [490, 0], [110, 0.05], [130, 0.10], [3166.67, 0.175],
    [16000, 0.25], [30520, 0.30], [Infinity, 0.35],
  ];
  let rem = chargeable, tax = 0;
  for (const [width, rate] of bands) { const inBand = Math.min(rem, width); tax += inBand * rate; rem -= inBand; if (rem <= 0) break; }
  return Math.round(tax * 100) / 100;
}
/** Oracle: employee net for a plain basic salary, no benefits/deductions. */
function plainNet(basic: number) {
  const ssnitEE = Math.round(basic * 0.055 * 100) / 100;
  const chargeable = Math.round((basic - ssnitEE) * 100) / 100;
  const paye = payeMonthly(chargeable);
  return { ssnitEE, chargeable, paye, statutory: Math.round((ssnitEE + paye) * 100) / 100, net: Math.round((basic - ssnitEE - paye) * 100) / 100 };
}

test.describe('BETA · Payroll calc engine (oracle-checked, read-only)', () => {
  test.skip(!isBetaConfigured, 'BETA_* not configured.');
  test.slow();

  test('oracle self-check — ZZQA GHS 3,000 and high earner GHS 250,000', () => {
    const zzqa = plainNet(3000);
    expect(zzqa.ssnitEE).toBe(165);
    expect(zzqa.chargeable).toBe(2835);
    expect(zzqa.paye).toBeCloseTo(386.88, 2);
    expect(zzqa.statutory).toBeCloseTo(551.88, 2);
    expect(zzqa.net).toBeCloseTo(2448.12, 2);

    const hi = plainNet(250000);
    expect(hi.ssnitEE).toBe(13750);
    expect(hi.chargeable).toBe(236250);
    expect(hi.paye).toBeCloseTo(78770.34, 2);
    expect(hi.statutory).toBeCloseTo(92520.34, 2);
    expect(hi.net).toBeCloseTo(157479.66, 2);
  });

  test('TC-BETA-CALC-SSNIT/PAYE-001 — Paid September run matches the oracle to the cent', async ({ page, bq }) => {
    await betaReady(page);
    await betaGo(page, 'Run Payroll');
    await page.getByRole('button', { name: /Payroll History/i }).click();
    await page.getByRole('row', { name: /Regular Payroll.*Sep.*Paid/i }).getByRole('button').first().click();
    await expect(page.getByText(/Paid on/i)).toBeVisible({ timeout: 30_000 });
    const shot = await bq.snap('beta-payroll', 'sept-paid-run');

    // ZZQA AlphaOne row: base 3,000 → taxes 551.88, net 2,448.12
    const zzqa = page.getByRole('row', { name: /ZZQA\s+AlphaOne/i });
    await expect(zzqa.getByText('GH₵ 551.88')).toBeVisible();
    await expect(zzqa.getByText('GH₵ 2,448.12')).toBeVisible();
    // TaShya (5,000 basic + 500 BIK): taxes 1,179.75, cash net 3,820.25
    const tashya = page.getByRole('row', { name: /TaShya/i });
    await expect(tashya.getByText('GH₵ 1,179.75')).toBeVisible();
    await expect(tashya.getByText('GH₵ 3,820.25')).toBeVisible();
    // Run-level employer pension/SSNIT = 13% × 8,000
    await expect(page.getByText('GH₵ 1,040.00').first()).toBeVisible();
    expect(shot).toBeTruthy();
  });

  test('TC-BETA-CFG-STAT-002 — mandatory statutory items missing an active rate (BETA-F-001)', async ({ page, bq }) => {
    await betaReady(page);
    await betaGo(page, 'Settings');
    await page.getByRole('link', { name: /Tax & Statutory Setup/i }).click();
    await expect(page.getByRole('heading', { name: /Tax & Statutory Configuration/i })).toBeVisible({ timeout: 30_000 });
    await page.getByRole('button', { name: /Statutory Items/i }).click();
    await page.waitForTimeout(4000);
    const shot = await bq.snap('beta-settings', 'statutory-items');

    // Overtime Junior / Pension Excess / Tier 3 show "No active rate" — payroll still runnable.
    const unrated = await page.getByText('No active rate').count();
    expect(unrated, 'BETA-F-001: mandatory items with no active rate on a "setup complete" tenant').toBeGreaterThan(0);
    expect(shot).toBeTruthy();
  });
});
