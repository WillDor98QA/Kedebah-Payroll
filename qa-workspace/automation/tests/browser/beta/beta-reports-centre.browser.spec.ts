/**
 * beta-reports-centre.browser.spec.ts — PERMANENT regression asset.
 *
 * Reports Centre — Phase 3. Reverse-engineered live on BETA 2026-09-09 (evidence/beta/P3-03..P3-06).
 * Read-only: these specs only generate reports, so they are guarded on `isBetaConfigured` and
 * self-skip when the tenant has no paid September / 2026 data.
 *
 * Catalogue (7 categories / 12 entries): Payroll Summary · Statutory Remittance · Variance &
 * Comparison · Annual Payroll · Year-End Tax Filing · P.A.Y.E Annual Reconciliation · Audit log ·
 * Leave Payroll Impact · Attendance Payroll Impact · Compensation Change History · Statutory & tax
 * configuration history · Snwolley AI chat.
 *
 * Guards:
 *   TC-BETA-NEG-RPT-001     — "Generate" with no period is a silent no-op (no error). [FAILS today — UX]
 *   TC-BETA-RPT-SUMMARY-001 — Payroll Summary "Net Pay" must exclude employer contributions. [FAILS today: BETA-F-024]
 *   TC-BETA-RPT-SUMMARY-002 — a period summary must include the off-cycle run. [FAILS today: BETA-F-025]
 *   TC-BETA-RPT-ANNUAL-001  — Annual Payroll Report reconciles to every paid 2026 run (off-cycle + termination). [PASS]
 *   TC-BETA-RPT-PAYE-001    — PAYE Reconciliation chargeable base must include BIK. [FAILS today: BETA-F-026]
 *   TC-BETA-RPT-STATCFG-001 — Statutory config history shows the Tier 1 5.5 / 8 split and the 20% Board rate. [PASS]
 */
import { test, expect } from '../../../fixtures/browser.fixture.js';
import { betaReady, betaGo, betaGoUrl } from './_beta-shell.js';
import { isBetaConfigured } from '../../../config/env.js';

async function openReport(page: import('@playwright/test').Page, name: RegExp) {
  await betaGo(page, 'Reports');
  await expect(page.getByRole('heading', { name: /Reports Centre/i })).toBeVisible({ timeout: 30_000 });
  // A report may be a "Popular" chip or a category card button.
  await page.getByRole('button', { name }).first().click();
  await page.waitForLoadState('networkidle').catch(() => {});
}

async function pickPeriod(page: import('@playwright/test').Page, label: RegExp, period: string) {
  await page.getByRole('button', { name: label }).click();
  await page.getByRole('option', { name: period }).click();
}

test.describe('BETA · Reports Centre (Phase 3)', () => {
  test.skip(!isBetaConfigured, 'BETA_* not configured.');
  test.slow();

  test('TC-BETA-NEG-RPT-001 — Payroll Summary "Generate" with no period is a silent no-op [FAILS today — UX]', async ({ page }) => {
    await openReport(page, /^Payroll Summary$/);
    await expect(page.getByRole('heading', { name: /Payroll Summary Report/i })).toBeVisible({ timeout: 30_000 });
    await page.getByRole('button', { name: /Generate Report/i }).click();
    // Expectation once fixed: a visible "period is required" error.
    await expect(page.getByText(/period is required|select a period/i),
      'no error shown for missing period — silent no-op').toBeVisible({ timeout: 5_000 });
  });

  test('TC-BETA-RPT-SUMMARY-001/002 — Payroll Summary net pay excludes employer SSNIT and includes the off-cycle run [FAILS today: BETA-F-024 / F-025]', async ({ page }) => {
    await openReport(page, /^Payroll Summary$/);
    await pickPeriod(page, /Payroll Period/i, 'September 2026');
    await page.getByRole('button', { name: /Generate Report/i }).click();
    await page.waitForTimeout(3000);
    const body = await page.locator('body').innerText();
    test.skip(!/September 2026/.test(body) || !/Net Pay/i.test(body), 'no Sept payroll data on this tenant');

    // BETA-F-024: employee net = gross − employee-only statutory. With the Sept regular run this is
    // GH₵ 6,268.37, not GH₵ 5,228.37 (which wrongly nets out the GH₵ 1,040 employer SSNIT).
    expect(body, 'BETA-F-024: net pay must not net out employer contributions').not.toMatch(/Net Pay[\s\S]{0,40}5,228\.37/);
    // BETA-F-025: the period must include the off-cycle run (gross 9,000, PAYE 1,357.38), not just 8,000.
    expect(body, 'BETA-F-025: off-cycle run omitted from the period summary').not.toMatch(/Total Gross Earnings[\s\S]{0,30}8,000\.00/);
  });

  test('TC-BETA-RPT-ANNUAL-001 — Annual Payroll Report reconciles to every paid 2026 run', async ({ page }) => {
    await openReport(page, /Annual Payroll Report/);
    await pickPeriod(page, /^Year/i, '2026');
    await page.getByRole('button', { name: /Generate Report/i }).click();
    await page.waitForTimeout(3000);
    const body = await page.locator('body').innerText();
    test.skip(!/Total Gross/i.test(body), 'no 2026 payroll data on this tenant');

    // Off-cycle + severance both present; PAYE aggregates all three runs; Tier 1 relief is employee-only.
    await expect(page.getByText(/Off-cycle payment/i)).toBeVisible();
    await expect(page.getByText(/Severance/i)).toBeVisible();
    expect(body).toMatch(/PAYE[\s\S]{0,40}2,914\.63/);
    expect(body).toMatch(/Tier 1[\s\S]{0,40}605\.00/);
  });

  test('TC-BETA-RPT-PAYE-001 — PAYE Reconciliation chargeable base must include benefits-in-kind [FAILS today: BETA-F-026]', async ({ page }) => {
    await openReport(page, /PAYE Reconciliation|P\.A\.Y\.E Annual Reconciliation/);
    await pickPeriod(page, /Payroll Period/i, 'September 2026');
    await pickPeriod(page, /^Year/i, '2026');
    await page.getByRole('button', { name: /Generate Report/i }).click();
    await page.waitForTimeout(3000);
    const body = await page.locator('body').innerText();
    test.skip(!/Chargeable Income/i.test(body), 'no Sept PAYE data on this tenant');

    // The report shows Chargeable GH₵ 7,560 (= 8,000 − 440) but the PAYE withheld (1,291.63) is
    // computed on GH₵ 8,060 incl. TaShya's GH₵ 500 BIK. Once fixed the chargeable line reflects the BIK.
    expect(body, 'BETA-F-026: BIK excluded from chargeable income while taxed').not.toMatch(/Chargeable Income[\s\S]{0,30}7,560\.00/);
  });

  test('TC-BETA-RPT-STATCFG-001 — Statutory config history exposes the Tier 1 5.5 / 8 split and the 20% Board rate', async ({ page }) => {
    await betaGoUrl(page, '/reports/statutory-config-versions');
    await expect(page.getByRole('heading', { name: /Statutory & tax configuration history/i })).toBeVisible({ timeout: 30_000 });
    await page.waitForTimeout(2500);
    const body = await page.locator('body').innerText();
    expect(body).toMatch(/Tier 1[\s\S]{0,80}Employee 5\.5%.*Employer 8%/);
    expect(body).toMatch(/Board Member Tax[\s\S]{0,80}Employee 20%/);
  });
});
