/**
 * beta-benefits.browser.spec.ts — PERMANENT regression asset.
 *
 * BTL onboarding items #4 / #6 / #7 (benefits model). Reverse-engineered live on BETA 2026-09-09
 * (reports/BETA-04; evidence/beta/BTL-0*.png).
 *
 *   #4 — benefit assigned to a specific employee must show on that employee's profile immediately.
 *        (On the old BTL tenant it did not; on BETA it does — this spec guards the fix.)
 *   #6 — one reusable benefit definition + per-staff amount (not one benefit per staff).
 *   #7 — Benefits-in-Kind seeded with the correct Ghana rates.
 */
import { test, expect } from '../../../fixtures/browser.fixture.js';
import { betaReady, betaGoUrl } from './_beta-shell.js';
import { isBetaConfigured } from '../../../config/env.js';

test.describe('BETA · Benefits model (BTL #4 / #6 / #7)', () => {
  test.skip(!isBetaConfigured, 'BETA_* not configured.');
  test.slow();

  test('TC-BETA-BTL07-001 — Benefits-in-Kind are seeded with correct Ghana rates', async ({ page, bq }) => {
    await betaReady(page);
    await betaGoUrl(page, '/setup/earnings-benefits-deductions?tab=benefits');
    await expect(page.getByRole('heading', { name: /Earnings, Benefits & Deductions/i })).toBeVisible({ timeout: 30_000 });
    await page.waitForTimeout(3000);
    const shot = await bq.snap('beta-benefits', 'bik-catalog');

    const expectRate = async (name: RegExp, rate: string) =>
      expect(page.getByRole('row', { name }), `${name} = ${rate}`).toContainText(rate);
    await expectRate(/Driver, Vehicle and Fuel/i, '12.5%');
    await expectRate(/Vehicle with Fuel/i, '10%');
    await expectRate(/Accommodation Only/i, '7.5%');
    await expectRate(/Shared Accommodation/i, '2.5%');
    // All BIK are Non-Cash + Taxable + % of Cash Emoluments.
    await expect(page.getByRole('row', { name: /Accommodation Only/i })).toContainText(/Non-Cash/i);
    expect(shot).toBeTruthy();
  });

  test('TC-BETA-BTL04-001 — a benefit assigned to a specific employee shows on their profile', async ({ page, bq }) => {
    await betaReady(page);
    await betaGoUrl(page, '/setup/benefits/new');
    await expect(page.getByRole('heading', { name: /Create benefit/i })).toBeVisible({ timeout: 30_000 });

    const code = `BEN-REG-${Date.now().toString().slice(-6)}`;
    await page.getByRole('radio', { name: /^Cash$/i }).check();
    await page.getByRole('textbox', { name: /Company Vehicle/i }).fill(`ZZQA Regression Allowance ${code}`);
    await page.getByRole('textbox', { name: /Auto-generated if blank/i }).fill(code);
    await page.getByLabel('Select method').click();
    await page.getByRole('option', { name: 'Fixed Amount' }).click();
    await page.getByRole('spinbutton', { name: '0.00' }).first().fill('800');
    await page.getByLabel('None (unassigned)').click();
    await page.getByRole('option', { name: /Specific employees/i }).click();
    await page.getByRole('button', { name: /Select employees/i }).click();
    await page.getByRole('option', { name: /ZZQA AlphaOne/i }).click();
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: /Create Benefit/i }).click();
    await expect(page.getByRole('heading', { name: /Earnings, Benefits & Deductions/i })).toBeVisible({ timeout: 30_000 });

    // The assigned benefit must surface on the employee profile (BTL #4).
    await betaGoUrl(page, '/employees/3'); // ZZQA AlphaOne
    await expect(page.getByRole('heading', { name: /Employee profile/i })).toBeVisible({ timeout: 30_000 });
    await page.waitForTimeout(3000);
    const shot = await bq.snap('beta-benefits', 'emp-profile-after-assign');
    await expect(page.getByText(new RegExp(code)), 'BTL #4: assigned benefit visible on the employee').toBeVisible();
    await expect(page.getByText(/GH₵ 800\.00.*Fixed Amount/i)).toBeVisible();
    expect(shot).toBeTruthy();
  });

  test('TC-BETA-BTL06-001 — one benefit definition supports per-staff amounts (design)', async ({ page }) => {
    await betaReady(page);
    await betaGoUrl(page, '/setup/benefits/new');
    await expect(page.getByRole('heading', { name: /Create benefit/i })).toBeVisible({ timeout: 30_000 });
    // The create page states the model explicitly.
    await expect(page.getByText(/Amounts are set per employee elsewhere/i)).toBeVisible();
    await expect(page.getByText(/on the employee's own profile, or for many at once under Adjustments/i)).toBeVisible();
  });
});
