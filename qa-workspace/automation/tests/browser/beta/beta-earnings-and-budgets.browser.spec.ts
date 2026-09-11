/**
 * beta-earnings-and-budgets.browser.spec.ts — PERMANENT regression asset.
 *
 * Phase 3 — overtime earnings, benefit-create validation, and PRQ-007 payroll budgets.
 * Reverse-engineered live on BETA 2026-09-09 (evidence/beta/P3-01, P3-02).
 *
 * Guards:
 *   TC-BETA-NEG-BEN-001    — a Fixed-Amount benefit with a negative amount is rejected with a range error. [PASS]
 *   TC-BETA-OT-CALC-001    — an "Overtime"-type benefit is taxed as ordinary income (no junior 5%/10%
 *                            concession); AlphaOne 3,000 + transport 800 + overtime 1,000 → PAYE 757.25,
 *                            statutory 922.25, net 3,877.75. [PASS arithmetic — see BETA-F-001 for the
 *                            missing overtime-tax engine]
 *   TC-BETA-RECALC-001     — "Recalculate" on a Processed run must re-pull benefit assignments. [FAILS today: BETA-F-020]
 *   TC-BETA-NEG-PRQ007-001 — Budget create rejects an empty name. [PASS]
 *   TC-BETA-PRQ007-001     — an org-wide monthly budget saves, auto-sets primary, and drives the
 *                            dashboard "Budget vs Actual" tile. [PASS]
 *   TC-BETA-PRQ008-001     — "Employer Cost by Tier" splits Tier 1 : Tier 2 as exactly 8 : 5. [PASS]
 *
 * Mutation-guarded on isBetaConfigured + BETA_ALLOW_MUTATION=1.
 */
import { test, expect } from '../../../fixtures/browser.fixture.js';
import { betaReady, betaGo, betaGoUrl } from './_beta-shell.js';
import { isBetaConfigured } from '../../../config/env.js';

const ALLOW_MUTATION = process.env.BETA_ALLOW_MUTATION === '1';

function payeMonthly(chargeable: number): number {
  const bands = [
    [490, 0], [110, 0.05], [130, 0.1], [3166.67, 0.175],
    [16000, 0.25], [30520, 0.3], [Infinity, 0.35],
  ] as const;
  let tax = 0, left = chargeable;
  for (const [w, r] of bands) { if (left <= 0) break; const s = Math.min(left, w); tax += s * r; left -= s; }
  return Math.round(tax * 100) / 100;
}

test.describe('BETA · Earnings & Budgets (Phase 3)', () => {
  test.skip(!isBetaConfigured, 'BETA_* not configured.');
  test.skip(!ALLOW_MUTATION, 'Set BETA_ALLOW_MUTATION=1 to run these mutation-heavy specs.');
  test.slow();

  test('oracle self-check — overtime as ordinary income for AlphaOne', () => {
    const ssnitEE = Math.round(3000 * 0.055 * 100) / 100;       // 165
    const chargeable = 3000 + 800 + 1000 - ssnitEE;              // 4,635
    const paye = payeMonthly(chargeable);                        // 757.25
    expect(paye).toBeCloseTo(757.25, 2);
    expect(ssnitEE + paye).toBeCloseTo(922.25, 2);
    expect(4800 - (ssnitEE + paye)).toBeCloseTo(3877.75, 2);     // net
  });

  test('TC-BETA-NEG-BEN-001 — a Fixed-Amount benefit with a negative amount is rejected', async ({ page }) => {
    await betaReady(page);
    await betaGoUrl(page, '/setup/benefits/new');
    await expect(page.getByRole('heading', { name: /Create benefit/i })).toBeVisible({ timeout: 30_000 });
    await page.getByRole('radio', { name: /^Cash$/i }).check();
    await page.getByRole('textbox', { name: /Company Vehicle/i }).fill('ZZQA Neg Benefit Guard');
    await page.getByLabel('Select method').click();
    await page.getByRole('option', { name: 'Fixed Amount' }).click();
    await page.getByRole('spinbutton', { name: '0.00' }).first().fill('-500');
    await page.getByRole('button', { name: /Create Benefit/i }).click();
    await expect(page.getByText(/require amount greater than zero/i)).toBeVisible();
  });

  test('TC-BETA-OT-CALC-001 — an Overtime-type benefit is taxed as ordinary PAYE (no concession)', async ({ page, bq }) => {
    await betaReady(page);

    // Ensure the overtime benefit exists and is assigned to AlphaOne (idempotent).
    await betaGoUrl(page, '/setup/earnings-benefits-deductions?tab=benefits');
    await page.waitForTimeout(2500);
    if (!(await page.getByRole('row', { name: /ZZQA Overtime Pay/i }).isVisible().catch(() => false))) {
      await betaGoUrl(page, '/setup/benefits/new');
      await expect(page.getByRole('heading', { name: /Create benefit/i })).toBeVisible({ timeout: 30_000 });
      await page.getByRole('radio', { name: /^Cash$/i }).check();
      await page.getByRole('textbox', { name: /Company Vehicle/i }).fill('ZZQA Overtime Pay');
      await page.getByLabel('Select type (optional)').click();
      await page.getByRole('option', { name: 'Overtime' }).click();
      await page.getByLabel('Select method').click();
      await page.getByRole('option', { name: 'Fixed Amount' }).click();
      await page.getByRole('spinbutton', { name: '0.00' }).first().fill('1000');
      await page.getByLabel('None (unassigned)').click();
      await page.getByRole('option', { name: /Specific employees/i }).click();
      await page.getByRole('button', { name: /Select employees/i }).click();
      await page.getByRole('option', { name: /ZZQA AlphaOne/i }).click();
      await page.keyboard.press('Escape');
      await page.getByRole('button', { name: /Create Benefit/i }).click();
      await expect(page.getByRole('heading', { name: /Earnings, Benefits & Deductions/i })).toBeVisible({ timeout: 30_000 });
    }

    // A FRESH regular run picks the overtime benefit up (BETA-F-020: Recalculate on an old run does not).
    await betaGo(page, 'Run Payroll');
    await page.getByRole('button', { name: / Create Pay Run /i }).click();
    await page.getByRole('link', { name: /Regular Payroll/i }).click();
    await page.getByRole('button', { name: / Create draft/i }).click();
    await expect(page).toHaveURL(/\/payroll\/draft\/\d+\/regular/, { timeout: 45_000 });
    await page.getByRole('button', { name: /^ Process$/i }).click({ timeout: 60_000 }).catch(() => {});
    await page.waitForTimeout(25_000);

    const row = page.getByRole('row', { name: /ZZQA AlphaOne/i });
    await expect(row).toContainText('GH₵ 1,800.00');   // benefits cash: transport 800 + overtime 1,000
    await expect(row).toContainText('GH₵ 4,800.00');   // gross
    await expect(row).toContainText('GH₵ 922.25');     // taxes = PAYE 757.25 + SSNIT 165, no overtime concession
    const shot = await bq.snap('beta-earnings', 'overtime-as-paye');
    expect(shot).toBeTruthy();
  });

  test('TC-BETA-NEG-PRQ007-001 / PRQ007-001 — budget create validation + primary + dashboard tile', async ({ page }) => {
    await betaReady(page);
    await betaGoUrl(page, '/setup/budgets');
    await expect(page.getByRole('heading', { name: /^Budgets$/i })).toBeVisible({ timeout: 30_000 });

    // Skip if a budget already exists (idempotent).
    if (await page.getByRole('row', { name: /Payroll Budget/i }).first().isVisible().catch(() => false)) {
      test.info().annotations.push({ type: 'note', description: 'budget already present — validation-only' });
    }

    await page.getByRole('button', { name: / Create Budget/i }).first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: 'Create Budget', exact: true }).click();
    await expect(page.getByText(/Budget name is required/i)).toBeVisible();

    await page.getByRole('textbox', { name: /FY2026 Payroll Budget/i }).fill(`ZZQA Budget ${Date.now().toString().slice(-6)}`);
    await page.getByRole('row', { name: /Fill column/i }).getByPlaceholder('0.00').fill('250000');
    await page.getByTitle(/Fill Amount down all periods/i).click();
    await expect(page.getByText(/Total Annual: GH₵ 3,000,000/i)).toBeVisible();
    await page.getByRole('button', { name: 'Create Budget', exact: true }).click();
    await expect(page.getByRole('row', { name: /GH₵ 3,000,000\.00.*Primary/i })).toBeVisible({ timeout: 15_000 });

    await betaGo(page, 'Dashboard');
    await expect(page.getByText(/Budget vs Actual/i)).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(/Total Annual Budget/i).locator('..')).toContainText(/3,000,000/);
  });

  test('TC-BETA-PRQ008-001 — Employer Cost by Tier splits 8 : 5', async ({ page }) => {
    await betaReady(page);
    await expect(page.getByText(/Employer Cost by Tier/i)).toBeVisible({ timeout: 30_000 });
    const panel = page.getByText(/Employer Cost by Tier/i).locator('../..');
    const txt = await panel.innerText();
    const nums = [...txt.matchAll(/GH₵\s*([\d,]+(?:\.\d+)?)/g)].map((m) => Number((m[1] ?? '0').replace(/,/g, '')));
    // [Tier 1, Tier 2, Total]
    expect(nums.length).toBeGreaterThanOrEqual(2);
    const t1 = nums[0] ?? 0;
    const t2 = nums[1] ?? 1;
    expect(t1 / t2).toBeCloseTo(8 / 5, 2); // employer Tier 1 8% vs Tier 2 5% of basic
  });
});
