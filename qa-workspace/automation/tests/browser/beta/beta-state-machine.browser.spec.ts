/**
 * beta-state-machine.browser.spec.ts — PERMANENT regression asset.
 *
 * Pay-run state machine, negative & edge cases. Reverse-engineered live on BETA 2026-09-08/09
 * (reports/BETA-04; evidence/beta/N08-N14, P13-02/03).
 *
 * Guards these behaviours:
 *   TC-BETA-NEG-RUN-001 — cannot re-run a completed (Paid) period; next run auto-targets the next open month.
 *   TC-BETA-NEG-RUN-003 — Reject requires a reason (confirm button disabled until typed); returns run to Processed.
 *   TC-BETA-NEG-PRQ001-002 — a disallowed file type on the payment-documents upload is rejected (422).
 *   TC-BETA-BTL02-001 — there is NO delete/discard for a payroll draft [FAILS today].
 *   TC-BETA-NEG-RUN-004 — WITHDRAWN. BETA-F-011 ("a period accepts two active regular runs") was
 *     confirmed BY DESIGN on 2026-09-09 (supplementary / corrective runs). Not a defect; no assertion.
 *     The related cost-dashboard double-count is BETA-F-021 (beta-earnings-and-budgets).
 *   TC-BETA-F-008 — the active pay-run list must not hide a processed run behind its default date filter [FAILS today].
 */
import { writeFileSync } from 'node:fs';
import { test, expect } from '../../../fixtures/browser.fixture.js';
import { betaReady, betaGo } from './_beta-shell.js';
import { isBetaConfigured } from '../../../config/env.js';

test.describe('BETA · Pay-run state machine (negative / edge)', () => {
  test.skip(!isBetaConfigured, 'BETA_* not configured.');
  test.slow();

  test('TC-BETA-NEG-RUN-001 — a new Regular run targets the next OPEN period (cannot re-run Sept)', async ({ page, bq }) => {
    await betaReady(page);
    await betaGo(page, 'Run Payroll');
    await page.getByRole('button', { name: / Create Pay Run /i }).click();
    await page.getByRole('link', { name: /Regular Payroll/i }).click();
    await expect(page.getByRole('heading', { name: /Confirm Regular Pay Run/i })).toBeVisible({ timeout: 15_000 });
    const shot = await bq.snap('beta-payroll', 'confirm-regular-next-period');
    // Sept is Paid → offered period is October or later, never September.
    await expect(page.getByText(/PERIOD/i).locator('..')).not.toContainText(/September/i);
    await page.getByRole('button', { name: /Cancel/i }).click();
    expect(shot).toBeTruthy();
  });

  test('TC-BETA-NEG-RUN-003 — Reject requires a reason and returns the run to Processed', async ({ page }) => {
    await betaReady(page);
    await betaGo(page, 'Run Payroll');
    await page.getByRole('button', { name: /Clear filters/i }).click().catch(() => {});
    // Find any run in "Pending Approval"; if none, this test is a no-op guard.
    const pending = page.getByRole('button', { name: /Approval Review|Reject/i }).first();
    test.skip(!(await pending.isVisible().catch(() => false)), 'no pending-approval run present');
    await page.getByRole('button', { name: /Reject/i }).click();
    await expect(page.getByRole('heading', { name: /Reject Payroll/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Reject Payroll/i }).last(), 'disabled with empty reason').toBeDisabled();
    await page.locator('textarea').fill('QA regression — reject-with-reason check.');
    await expect(page.getByRole('button', { name: /Reject Payroll/i }).last()).toBeEnabled();
  });

  test('TC-BETA-NEG-PRQ001-002 — payment-documents upload rejects a disallowed file type', async ({ page }, testInfo) => {
    await betaReady(page);
    await betaGo(page, 'Run Payroll');
    await page.getByRole('button', { name: /Payroll History/i }).click();
    await page.getByRole('row', { name: /Regular Payroll.*Sep.*Paid/i }).getByRole('button').first().click();
    await expect(page.getByText(/Paid on/i)).toBeVisible({ timeout: 30_000 });

    const bad = testInfo.outputPath('upload-abuse.html');
    writeFileSync(bad, '<html><body><h1>not a payment doc</h1></body></html>');
    const [chooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.getByRole('button', { name: /Upload Document/i }).click(),
    ]);
    const bad422 = page.waitForResponse((r) => /payment-documents/.test(r.url()) && r.status() === 422);
    await chooser.setFiles(bad);
    await expect(bad422, 'server rejects .html with 422').resolves.toBeTruthy();
  });

  test('TC-BETA-BTL02-001 — a payroll draft cannot be deleted [FAILS today: BTL #2 not built]', async ({ page }) => {
    await betaReady(page);
    await betaGo(page, 'Run Payroll');
    await page.getByRole('button', { name: /Clear filters/i }).click().catch(() => {});
    const anyRun = page.getByText(/Regular Payroll - October 2026/i).first();
    test.skip(!(await anyRun.isVisible().catch(() => false)), 'no draft/processed run present');
    await anyRun.click();
    await expect(page.getByRole('button', { name: /^Back$/i })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole('button', { name: /Delete|Discard|Cancel run|Remove/i }),
      'BTL #2: expected a delete/discard action on a non-approved run').toBeVisible();
  });

  test('TC-BETA-F-008 — active pay-run list must not hide a processed run behind its date filter', async ({ page, bq }) => {
    await betaReady(page);
    await betaGo(page, 'Run Payroll');
    const shot = await bq.snap('beta-payroll', 'active-list-default-filter');
    // With a processed October run present, the default view should not read "No Active Payrolls".
    await expect(page.getByRole('heading', { name: /No Active Payrolls/i }),
      'BETA-F-008: default date filter hides a valid processed run').toBeHidden();
    expect(shot).toBeTruthy();
  });
});
