/**
 * beta-employee-validation.browser.spec.ts — PERMANENT regression asset.
 *
 * Add-Employee wizard: validation / negative / boundary. Reverse-engineered live on the BETA
 * environment 2026-09-08/09 (reports/BETA-04-phase1b-negative-boundary-edge.md, evidence/beta/N0*.png).
 * Guarded on isBetaConfigured — set BETA_* in automation/.env to run.
 *
 * TC-BETA-NEG-EMP-001..006, TC-BETA-BND-EMP-007
 */
import { test, expect } from '../../../fixtures/browser.fixture.js';
import { betaReady, betaGo } from './_beta-shell.js';
import { isBetaConfigured } from '../../../config/env.js';

test.describe('BETA · Add Employee — validation & boundary', () => {
  test.skip(!isBetaConfigured, 'BETA_* not configured (see reports/BETA-01-feasibility-map.md).');
  test.slow();

  test.beforeEach(async ({ page }) => {
    await betaReady(page);
    await betaGo(page, 'Employees');
    await page.getByRole('button', { name: /Add employee/i }).click();
    await expect(page.getByRole('heading', { name: /Basic details/i })).toBeVisible({ timeout: 30_000 });
  });

  test('TC-BETA-NEG-EMP-001 — empty step 1 is blocked with per-field errors', async ({ page, bq }) => {
    await page.getByRole('button', { name: /Save & continue/i }).click();
    const shot = await bq.snap('beta-employees', 'N01-empty-form');
    for (const msg of ['First name is required', 'Last name is required', 'Preferred name is required',
      'Employee ID is required', 'First day of work is required', 'Work email is required', 'Position is required']) {
      await expect(page.getByText(msg), `error: ${msg}`).toBeVisible();
    }
    await expect(page.getByRole('heading', { name: /Basic details/i }), 'did not advance').toBeVisible();
    expect(shot).toBeTruthy();
  });

  test('TC-BETA-NEG-EMP-002 — invalid work email format is rejected', async ({ page }) => {
    await page.getByRole('textbox', { name: 'John', exact: true }).fill('ZZQA');
    await page.getByRole('textbox', { name: 'Doe', exact: true }).fill('NegTest');
    await page.getByRole('textbox', { name: 'Preferred name' }).fill('ZZQA Neg');
    await page.getByRole('textbox', { name: 'EMP001' }).fill(`ZZQA-NEG-${Date.now()}`);
    await page.locator('input[type="date"]').fill('2026-01-01');
    await page.getByRole('textbox', { name: 'john.doe@company.com' }).fill('not-an-email');
    await page.getByRole('button', { name: /Save & continue/i }).click();
    await expect(page.getByText(/Please enter a valid email address/i)).toBeVisible();
    await expect(page.getByRole('heading', { name: /Basic details/i })).toBeVisible();
  });

  test('TC-BETA-NEG-EMP-003/004 — negative and zero base salary are rejected', async ({ page }) => {
    // step 1
    await page.getByRole('textbox', { name: 'John', exact: true }).fill('ZZQA');
    await page.getByRole('textbox', { name: 'Doe', exact: true }).fill('SalBnd');
    await page.getByRole('textbox', { name: 'Preferred name' }).fill('ZZQA SalBnd');
    await page.getByRole('textbox', { name: 'EMP001' }).fill(`ZZQA-SB-${Date.now()}`);
    await page.locator('input[type="date"]').fill('2026-01-01');
    await page.getByRole('textbox', { name: 'john.doe@company.com' }).fill(`dwilliametornam+sb${Date.now()}@gmail.com`);
    await page.getByLabel('Board').click();
    await page.getByRole('option', { name: 'Full-time' }).click();
    await page.getByLabel('Select position').click();
    await page.getByRole('option', { name: 'Software Engineer' }).click();
    await page.getByRole('button', { name: /Save & continue/i }).click();
    // step 2 — compensation
    for (const bad of ['-1000', '0']) {
      await page.getByRole('spinbutton', { name: '0.00' }).fill(bad);
      await page.getByRole('button', { name: /Save & continue/i }).click();
      await expect(page.getByText(/Base salary amount is required|must be greater than 0/i), `rejected: ${bad}`).toBeVisible();
    }
  });

  test('TC-BETA-BND-EMP-007 — very large base salary (250,000) is accepted (no artificial cap)', async ({ page }) => {
    await page.getByRole('textbox', { name: 'John', exact: true }).fill('ZZQA');
    await page.getByRole('textbox', { name: 'Doe', exact: true }).fill('HiEarn');
    await page.getByRole('textbox', { name: 'Preferred name' }).fill('ZZQA HiEarn');
    await page.getByRole('textbox', { name: 'EMP001' }).fill(`ZZQA-HI-${Date.now()}`);
    await page.locator('input[type="date"]').fill('2026-01-01');
    await page.getByRole('textbox', { name: 'john.doe@company.com' }).fill(`dwilliametornam+hi${Date.now()}@gmail.com`);
    await page.getByLabel('Board').click();
    await page.getByRole('option', { name: 'Full-time' }).click();
    await page.getByLabel('Select position').click();
    await page.getByRole('option', { name: 'Software Engineer' }).click();
    await page.getByRole('button', { name: /Save & continue/i }).click();
    await page.getByRole('spinbutton', { name: '0.00' }).fill('250000');
    await page.getByRole('button', { name: /Save & continue/i }).click();
    await expect(page.getByRole('heading', { name: /Personal details/i }), 'advanced past compensation').toBeVisible({ timeout: 15_000 });
  });

  test('TC-BETA-BND-EMP-008 — a future "First Day of Work" is rejected on step 1 [BETA-F-036]', async ({ page }) => {
    const future = new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10);
    await page.getByRole('textbox', { name: 'John', exact: true }).fill('ZZQA');
    await page.getByRole('textbox', { name: 'Doe', exact: true }).fill('FutureHire');
    await page.getByRole('textbox', { name: 'Preferred name' }).fill('ZZQA FutureHire');
    await page.getByRole('textbox', { name: 'EMP001' }).fill(`ZZQA-FH-${Date.now()}`);
    await page.locator('input[type="date"]').fill(future);
    await page.getByRole('textbox', { name: 'john.doe@company.com' }).fill(`dwilliametornam+fh${Date.now()}@gmail.com`);
    await page.getByLabel('Board').click();
    await page.getByRole('option', { name: 'Full-time' }).click();
    await page.getByLabel('Select position').click();
    await page.getByRole('option', { name: 'Software Engineer' }).click();
    await page.getByRole('button', { name: /Save & continue/i }).click();
    // Current behaviour: blocked with "today or earlier". BETA-F-036 asks for future dates to be allowed —
    // if that changes, this assertion flips and the wizard should advance to Compensation.
    await expect(page.getByText(/today or earlier|before today/i)).toBeVisible();
    await expect(page.getByRole('heading', { name: /Compensation/i })).toHaveCount(0);
  });

  // TC-BETA-NEG-EMP-005 (Bank Transfer with no details) and -006 (duplicate Employee ID → 422 at final submit)
  // are covered by the full lifecycle spec's teardown-safe employee factory. See BETA-04 report for the manual runs.
  // TC-BETA-HIREDATE-FUTURE-001 (BETA-F-036) — the SERVER rule ("before today", rejecting == today) is only hit at
  // final submit / profile-edit; verified manually (ledger 2026-09-09). Client vs server boundary mismatch.
});
