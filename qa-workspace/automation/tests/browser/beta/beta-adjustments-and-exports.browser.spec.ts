/**
 * beta-adjustments-and-exports.browser.spec.ts — PERMANENT regression asset.
 *
 * PRQ-016 (bulk salary update tool), BTL #5 (bulk benefit adjustments, per-staff amounts),
 * PRQ-014 (GRA PAYE schedule, SSNIT/pension forms, statutory-remittance export).
 * Reverse-engineered live on BETA 2026-09-09 (reports/BETA-04; evidence/beta/P14-*, P16-*).
 */
import { test, expect } from '../../../fixtures/browser.fixture.js';
import { betaReady, betaGo, betaGoUrl } from './_beta-shell.js';
import { isBetaConfigured } from '../../../config/env.js';

test.describe('BETA · Adjustments (PRQ-016 / BTL#5)', () => {
  test.skip(!isBetaConfigured, 'BETA_* not configured.');
  test.slow();

  test('TC-BETA-PRQ016-001 — Salary Adjustment builds a multi-line round with per-employee preview', async ({ page, bq }) => {
    await betaReady(page);
    await betaGoUrl(page, '/management/adjustments');
    await expect(page.getByRole('heading', { name: /^Adjustments$/i })).toBeVisible({ timeout: 30_000 });
    await page.getByRole('button', { name: /New Salary Adjustment/i }).first().click();
    await expect(page.getByRole('heading', { name: /New Salary Adjustment/i })).toBeVisible({ timeout: 20_000 });

    await page.getByRole('textbox', { name: /Q3 2026/i }).fill(`ZZQA Regression Adj ${Date.now()}`);
    await page.getByRole('textbox', { name: /e\.g\. 10/i }).fill('10');
    await page.locator('input[type="date"]').fill('2026-12-01');
    await page.getByRole('button', { name: /Create Salary Adjustment/i }).click();

    await expect(page.getByRole('heading', { name: /PREVIEW/i })).toBeVisible({ timeout: 30_000 });
    const shot = await bq.snap('beta-adjustments', 'salary-adjustment-preview');
    // 10% increase → every row shows +10.00% and the totals reconcile.
    await expect(page.getByText('No overlapping employees across lines')).toBeVisible();
    await expect(page.getByRole('row', { name: /ZZQA\s+AlphaOne/i })).toContainText('+10.00%');
    await expect(page.getByText(/Total change/i).locator('..')).toContainText('+');
    // Leave as Draft — do NOT submit for approval.
    await expect(page.getByText(/^Draft$/i)).toBeVisible();
    expect(shot).toBeTruthy();
  });

  test('TC-BETA-BTL05-001 — Bulk Adjustments exports a per-staff editable sheet', async ({ page }) => {
    await betaReady(page);
    await betaGoUrl(page, '/management/adjustments?tab=bulk');
    await expect(page.getByRole('button', { name: /Bulk Adjustments/i })).toBeVisible({ timeout: 30_000 });
    await page.getByRole('button', { name: /^Benefits$/i }).click();
    await page.getByRole('button', { name: /Start a bulk adjustment/i }).click();
    await expect(page.getByRole('heading', { name: /Import \/ Export — Bulk Adjustments/i })).toBeVisible({ timeout: 15_000 });

    const dl = page.waitForEvent('download');
    await page.getByRole('button', { name: /Export current \(Excel\)/i }).click();
    const file = await dl;
    expect(file.suggestedFilename()).toMatch(/bulk-adjustments.*\.xlsx/i);
    // Columns confirmed live: employee_id, component_code, current_amount, amount, effective_from/to — per-row amount.
  });
});

test.describe('BETA · Statutory exports (PRQ-014)', () => {
  test.skip(!isBetaConfigured, 'BETA_* not configured.');
  test.slow();

  test('TC-BETA-PRQ014-001 — Statutory Remittance Report generates and exports', async ({ page, bq }) => {
    await betaReady(page);
    await betaGo(page, 'Reports');
    await page.getByRole('button', { name: /Statutory & Compliance/i }).click();
    await page.getByRole('button', { name: /Statutory Remittance Reports/i }).click();
    await expect(page.getByRole('heading', { name: /Statutory Remittance Reports/i })).toBeVisible({ timeout: 30_000 });
    await page.getByRole('button', { name: /Select a period/i }).click();
    await page.getByRole('option', { name: /September 2026/i }).click();
    await page.getByRole('button', { name: /Generate Report/i }).click();

    await expect(page.getByText(/Total Statutory Remittances/i)).toBeVisible({ timeout: 30_000 });
    const shot = await bq.snap('beta-reports', 'statutory-remittance');
    // GRA PAYE 1,291.63 ; NPRA Tier1 EE 440 / ER 640 ; Tier2 ER 400
    await expect(page.getByText('GH₵ 1,291.63').first()).toBeVisible();
    await expect(page.getByRole('row', { name: /Tier 1/i })).toContainText('GH₵ 440.00');
    const dl = page.waitForEvent('download');
    await page.getByRole('button', { name: /^ Export $/i }).click();
    await page.getByText('Export Excel').click();
    expect((await dl).suggestedFilename()).toMatch(/Statutory.*\.xlsx/i);
    expect(shot).toBeTruthy();
  });

  test('TC-BETA-PRQ014-002 — GRA PAYE Schedule is the official form and downloads', async ({ page }) => {
    await betaReady(page);
    await betaGoUrl(page, '/taxes/forms');
    await expect(page.getByRole('heading', { name: /^Forms$/i })).toBeVisible({ timeout: 30_000 });
    await page.getByRole('row', { name: /GRA PAYE Schedule/i }).getByRole('button').first().click();
    await expect(page.getByRole('heading', { name: /GRA PAYE Schedule/i })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/Total PAYE/i).locator('..')).toContainText('GH₵ 1,291.63');
    const dl = page.waitForEvent('download');
    await page.getByRole('button', { name: /GRA PAYE Schedule/i }).last().click();
    const file = await dl;
    expect(file.suggestedFilename()).toMatch(/GRA.PAYE.Schedule.*\.xlsx/i);
    // Sheet header (confirmed live): "EMPLOYER'S MONTHLY TAX DEDUCTIONS SCHEDULE (P.A.Y.E.)", col "Social Security Fund (5.5%)".
  });

  test('TC-BETA-PRQ014-004 — Bank payment file is NOT available anywhere [FAILS today: BETA-F-013]', async ({ page }) => {
    await betaReady(page);
    await betaGo(page, 'Run Payroll');
    await page.getByRole('button', { name: /Payroll History/i }).click();
    await page.getByRole('row', { name: /Regular Payroll.*Sep.*Paid/i }).getByRole('button').first().click();
    await expect(page.getByText(/Paid on/i)).toBeVisible({ timeout: 30_000 });
    // No bank/EFT/disbursement export control on the paid run.
    await expect(page.getByRole('button', { name: /bank file|payment file|EFT|disbursement/i }),
      'BETA-F-013: PRQ-014 bank payment file export missing').toBeVisible();
  });
});
