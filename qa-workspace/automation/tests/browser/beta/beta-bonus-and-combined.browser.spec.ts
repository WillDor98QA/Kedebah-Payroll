/**
 * beta-bonus-and-combined.browser.spec.ts — PERMANENT regression asset.
 *
 * PRQ-012 (standalone Bonus Payroll) and PRQ-013 (combined regular + bonus). Reverse-engineered live
 * on BETA 2026-09-09 (reports/BETA-04; evidence/beta/P12-*, P13-*).
 *
 * KEY REGRESSION — BETA-F-012 (AWAITING FINANCE RULING as of 2026-09-09): a bonus paid *combined*
 * with regular salary via "Add bonuses" on a regular run is taxed entirely at marginal PAYE, i.e.
 * differently from the *standalone* Bonus Payroll run (which applies the Ghana 5% concession).
 * Finance has not yet confirmed which treatment is correct or whether the two paths must agree.
 * This spec asserts:
 *   - standalone below-cap bonus → 5% flat  (PASS today)
 *   - standalone above-cap bonus → 5% on the cap + excess on the employee's marginal band  (PASS today)
 *   - combined bonus should ALSO get the 5% concession  (FAILS today — pins current behaviour)
 * The last test is the trip-wire: it fails now, and will start passing if/when the combined path is
 * changed to match the standalone one — at which point re-confirm against the finance ruling.
 *
 * The mutating create-a-bonus-run flow is documented in BETA-04; here we assert against the runs that
 * already exist on "Glenn and Co" (ZZQA Bonus Test Sep 2026, Regular Payroll October 2026 #4).
 */
import { test, expect } from '../../../fixtures/browser.fixture.js';
import { betaReady, betaGo } from './_beta-shell.js';
import { isBetaConfigured } from '../../../config/env.js';

test.describe('BETA · Bonus tax (PRQ-012 / PRQ-013)', () => {
  test.skip(!isBetaConfigured, 'BETA_* not configured.');
  test.slow();

  test('oracle — Ghana bonus rule for ZZQA AlphaOne (annual basic 36,000; 15% cap = 5,400)', () => {
    // Below cap: 5% flat.
    const belowTax = 3000 * 0.05;
    expect(belowTax).toBeCloseTo(150, 2);

    // Above cap (8,000): 5,400 @ 5% + excess 2,600 stacked on the employee's own monthly chargeable (2,835):
    //   2,835 → 3,896.67 @ 17.5% = 185.79 ;  3,896.67 → 5,435 @ 25% = 384.58  →  excess tax 570.37
    const capTax = 5400 * 0.05;                         // 270.00
    const excessTax = (3896.67 - 2835) * 0.175 + (5435 - 3896.67) * 0.25;
    expect(capTax + excessTax).toBeCloseTo(840.37, 1);

    // Combined regular+bonus SHOULD equal: regular statutory (551.88) + bonus 5% flat (150) = 701.88.
    // Beta currently produces 1,222.25 (whole bonus at marginal PAYE) — BETA-F-012.
    const combinedExpected = 551.88 + 150;
    expect(combinedExpected).toBeCloseTo(701.88, 2);
  });

  test('TC-BETA-PRQ012-CALC-001/002 — standalone Bonus Payroll applies the 5% concession', async ({ page, bq }) => {
    await betaReady(page);
    await betaGo(page, 'Run Payroll');
    await page.getByRole('button', { name: /Payroll History/i }).click().catch(() => {});
    await page.getByRole('link', { name: /ZZQA Bonus Test Sep 2026/i }).click()
      .catch(async () => { await page.getByText(/ZZQA Bonus Test Sep 2026/i).click(); });
    await expect(page.getByText(/Bonus Payroll/i)).toBeVisible({ timeout: 30_000 });
    const shot = await bq.snap('beta-bonus', 'standalone-processed');

    // Default 3,000 bonus → 5% flat = 150 (HighEarner row, kept at default).
    await expect(page.getByRole('row', { name: /ZZQA HighEarner/i }).getByText('GH₵ 150.00')).toBeVisible();
    // Override 8,000 bonus → 840.37 (AlphaOne row).
    await expect(page.getByRole('row', { name: /ZZQA\s+AlphaOne/i }).getByText('GH₵ 840.37')).toBeVisible();
    // Bonus not subject to SSNIT — employer pension/SSNIT on the run is 0.
    await expect(page.getByText('+ Employer contributions (pension / SSNIT)').locator('..')).toContainText('GH₵ 0.00');
    expect(shot).toBeTruthy();
  });

  test('TC-BETA-PRQ013-001 — combined regular+bonus keeps the 5% concession [FAILS today: BETA-F-012]', async ({ page, bq }) => {
    await betaReady(page);
    await betaGo(page, 'Run Payroll');
    // The October regular run #4 carries a 3,000 bonus on ZZQA AlphaOne alongside a 3,000 salary.
    await page.getByRole('button', { name: /Payroll History/i }).click().catch(() => {});
    // (list is date-filtered — BETA-F-008 — so clear filters if present)
    await page.getByRole('button', { name: /Clear filters/i }).click().catch(() => {});
    await page.getByText(/Regular Payroll - October 2026/i).first().click();
    await expect(page.getByText(/October 2026/i)).toBeVisible({ timeout: 30_000 });
    const shot = await bq.snap('beta-bonus', 'combined-processed');

    const row = page.getByRole('row', { name: /ZZQA\s+AlphaOne/i });
    // Correct behaviour: 551.88 regular + 150 bonus = 701.88. Beta currently: 1,222.25.
    await expect(row.getByText('GH₵ 701.88'),
      'BETA-F-012: combined bonus should get the 5% flat concession like the standalone run').toBeVisible();
    expect(shot).toBeTruthy();
  });

  /**
   * TC-BETA-BONUS-CAP-BOUNDARY-001 — verified MANUALLY on beta 2026-09-10 (needs a CLEAN employee with
   * no prior bonuses this tax year, plus a fresh Bonus run — too heavy for one guarded test here).
   *   - Bonus == exactly 15% of annual basic on a clean employee → 5% flat to the cent, labelled "Bonus Tax".
   *     (ZZQA MidHire: annual basic 37,200 → cap 5,580 → tax 279.00 = 5,580 × 5%.)
   *   - Same amount on an employee whose cumulative annual 15% allowance is exhausted → the whole bonus is
   *     taxed as "PAYE (Income Tax)", NOT "Bonus Tax" (ZZQA AlphaOne: 5,400 → 1,350 = flat 25%). Cumulative
   *     bonus-allowance tracking works; the flat-25% basis for the excess is a candidate defect
   *     (TC-BETA-BONUS-CAP-EXHAUSTED-001, ledger 2026-09-10) — graduated-from-zero would be 948.50.
   */
  test.fixme('TC-BETA-BONUS-CAP-BOUNDARY-001 — bonus at the exact 15% cap → 5% flat (needs a clean employee + fresh run)', async () => {});
});
