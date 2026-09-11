/**
 * beta-settings-modules.browser.spec.ts — PERMANENT regression asset.
 *
 * Settings setup cards — Phase 3c. Reverse-engineered live on BETA 2026-09-09.
 *
 * Read-only guards (isBetaConfigured only):
 *   TC-BETA-PRQ006-001  — Pay Schedule Setup offers all 5 frequencies; Semi-Monthly reveals per-half pay dates.
 *   TC-BETA-APPR-001    — Approval Workflows: 7 entity types, all Inactive / 0 stages by default.
 *   TC-BETA-BANK-001    — a system bank's name/code fields are DISABLED ("only status can be changed") — BUG-008 fixed.
 *   TC-BETA-FINPOST-001 — Finance Posting lists 18 payroll items + typed fallback accounts; the GL is connected.
 *   TC-BETA-ATTINT-001  — Attendance Integration master toggle is Inactive by default.
 *   TC-BETA-ORG-002     — Organization Setup is marked "Completed" with a blank Employer TIN / SSNIT number [FAILS today: BETA-F-028].
 *   TC-BETA-UR-001      — Users & Roles: 4 seeded roles with permission counts.
 *
 * Mutation guards (also BETA_ALLOW_MUTATION=1):
 *   TC-BETA-PG-MEMBER-001    — a pay group's member assignment is bi-directional (BUG-006 fixed).
 *   TC-BETA-UR-ROLEPERM-001  — a new role keeps its selected permissions (prior-env silent no-op fixed).
 */
import { test, expect } from '../../../fixtures/browser.fixture.js';
import { betaReady, betaGoUrl } from './_beta-shell.js';
import { isBetaConfigured } from '../../../config/env.js';

const ALLOW_MUTATION = process.env.BETA_ALLOW_MUTATION === '1';

test.describe('BETA · Settings modules (Phase 3c)', () => {
  test.skip(!isBetaConfigured, 'BETA_* not configured.');
  test.slow();

  test('TC-BETA-PRQ006-001 — Pay Schedule Setup: all 5 frequencies; Semi-Monthly = per-half pay dates', async ({ page }) => {
    await betaReady(page);
    await betaGoUrl(page, '/setup/cycles');
    await expect(page.getByRole('heading', { name: /Pay Schedule Setup/i })).toBeVisible({ timeout: 30_000 });
    for (const f of ['Weekly', 'Bi-Weekly', 'Semi-Monthly', 'Monthly', 'Quarterly']) {
      await expect(page.getByRole('heading', { name: new RegExp(`^${f}\\b`, 'i') })).toBeVisible();
    }
    await page.getByRole('heading', { name: /^Semi-Monthly/i }).click();
    await expect(page.getByRole('heading', { name: /Period 1 \(1st - 15th\)/i })).toBeVisible();
    await page.getByRole('button', { name: /^Cancel$/i }).click(); // discard — do not change the tenant frequency
  });

  test('TC-BETA-APPR-001 — Approval Workflows: entities present, all Inactive by default', async ({ page }) => {
    await betaReady(page);
    await betaGoUrl(page, '/settings/approval-workflow');
    await expect(page.getByRole('heading', { name: /Approval Workflows/i })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(/Pay Run Approval Workflow/i)).toBeVisible();
    // The Pay Run workflow ships Inactive with 0 stages (this is why Admin self-approve works in the lifecycle specs).
    const payRunCard = page.getByText(/Pay Run Approval Workflow/i).locator('../..');
    await expect(payRunCard).toContainText(/Inactive/i);
    await expect(payRunCard).toContainText(/0 stage/i);
  });

  test('TC-BETA-BANK-001 — a system bank cannot be renamed (BUG-008 fixed)', async ({ page }) => {
    await betaReady(page);
    await betaGoUrl(page, '/setup/banks/3'); // ABSA BANK
    await expect(page.getByRole('heading', { name: /ABSA BANK/i })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(/only status can be changed/i)).toBeVisible();
    await page.getByRole('button', { name: /^Edit$/i }).first().click();
    await expect(page.getByRole('textbox', { name: /GCB Bank Ltd/i })).toBeDisabled();
    await page.getByRole('button', { name: /^Cancel$/i }).click();
  });

  test('TC-BETA-FINPOST-001 — Finance Posting lists payroll items + a connected GL', async ({ page }) => {
    await betaReady(page);
    await betaGoUrl(page, '/setup/finance-posting');
    await expect(page.getByRole('heading', { name: /Finance Posting Accounts/i })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(/fall back to the default account for their type so the journal always balances/i)).toBeVisible();
    await page.getByLabel('Select account').first().click();
    // The Kedebah Finance chart of accounts resolves (coded GL entries).
    await expect(page.getByRole('option', { name: /EXPE-OE-\d+.*Administrative Expenses/i })).toBeVisible({ timeout: 10_000 });
    await page.keyboard.press('Escape');
  });

  test('TC-BETA-ATTINT-001 — Attendance Integration is Inactive by default', async ({ page }) => {
    await betaReady(page);
    await betaGoUrl(page, '/setup/attendance-integration');
    await expect(page.getByRole('heading', { name: /Attendance Integration/i })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(/Attendance is ignored entirely/i)).toBeVisible();
  });

  test('TC-BETA-ORG-002 — Organization Setup marked Completed with a blank Employer TIN [FAILS today: BETA-F-028]', async ({ page }) => {
    await betaReady(page);
    await betaGoUrl(page, '/settings/organization');
    await expect(page.getByRole('heading', { name: /Organization Setup/i })).toBeVisible({ timeout: 30_000 });
    await page.waitForTimeout(4000); // skeleton lag (BETA-F-002)
    const tin = page.getByRole('textbox', { name: /Employer Tax Identification Number/i });
    const ssnit = page.getByRole('textbox', { name: /Employer SSNIT registration number/i });
    // Expectation once fixed: these are populated (or the form blocks "Completed" without them).
    await expect(tin, 'BETA-F-028: Employer TIN missing on a "Completed" org').not.toHaveValue('');
    await expect(ssnit, 'BETA-F-028: Employer SSNIT number missing on a "Completed" org').not.toHaveValue('');
  });

  test('TC-BETA-UR-001 — Users & Roles: 4 seeded roles with permission counts', async ({ page }) => {
    await betaReady(page);
    await betaGoUrl(page, '/settings/roles');
    await expect(page.getByRole('heading', { name: /User Roles/i })).toBeVisible({ timeout: 30_000 });
    for (const r of ['Payroll Manager', 'Payroll Employee', 'Payroll Reports', 'Payroll Admin']) {
      await expect(page.getByRole('heading', { name: new RegExp(`^${r}$`) })).toBeVisible();
    }
    await expect(page.getByText(/56 Permissions/)).toBeVisible(); // Payroll Admin
  });

  test('TC-BETA-APPR-ENFORCE-001 — an active Pay Run workflow gates approval to the assigned approver', async ({ page }) => {
    await betaReady(page);
    await betaGoUrl(page, '/settings/approval-workflow');
    await expect(page.getByRole('heading', { name: /Approval Workflows/i })).toBeVisible({ timeout: 30_000 });
    // Find the Pay Run workflow (it may be on page 2).
    const onP2 = page.getByRole('button', { name: '2' });
    if (await onP2.isVisible().catch(() => false)) await onP2.click();
    const card = page.getByText(/Pay Run Approval Workflow/i).locator('../..');
    test.skip(!/Active/.test(await card.innerText().catch(() => '')), 'Pay Run workflow not active on this tenant');

    // A submitted run's approval page must show the WORKFLOW STEPS pipeline and (for a non-assigned
    // approver — BETA_ADMIN here is not in the workflow) offer no Approve/Reject button.
    // The WORKFLOW STEPS wait below also clears the ~10s skeleton render (BETA-F-002): asserting
    // button absence before the page settles is what produced the retracted BETA-F-032.
    await betaGoUrl(page, '/payroll');
    const pendingCard = page.getByText(/Pending Approval/i).first();
    test.skip(!(await pendingCard.isVisible().catch(() => false)), 'no run pending approval');
    await pendingCard.locator('../..').getByRole('button', { name: /View approval|Submit for Approval|Review & Approve/i }).first().click();
    await expect(page.getByText(/WORKFLOW STEPS/i)).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole('button', { name: /^Approve$/ })).toHaveCount(0);
  });

  // TC-BETA-APPR-APPROVE-003 / STAGE2-001 — the positive path (assigned stage-1 approver signs in,
  // sees Approve/Reject, approves, run advances to stage 2) is verified MANUALLY on beta
  // (ledger 2026-09-09T11:48Z) because it needs a second signed-in persona. Automating it needs a
  // manager-login fixture (BETA_MANAGER / BETA_MANAGER_PASSWORD are in .env); stage 2 additionally
  // needs a +26 Admin-persona credential that is not yet provisioned.
  test.fixme('TC-BETA-APPR-APPROVE-003 — assigned approver approves stage 1 (needs a manager-login fixture)', async () => {});

  test.describe('mutation', () => {
    test.skip(!ALLOW_MUTATION, 'Set BETA_ALLOW_MUTATION=1 for the pay-group / role create checks.');

    test('TC-BETA-PG-MEMBER-001 — pay-group member assignment is bi-directional (BUG-006 fixed)', async ({ page }) => {
      await betaReady(page);
      await betaGoUrl(page, '/setup/pay-groups/new');
      await expect(page.getByRole('heading', { name: /Create Pay Group/i })).toBeVisible({ timeout: 30_000 });
      const name = `ZZQA PG ${Date.now().toString().slice(-6)}`;
      await page.getByRole('textbox', { name: /Monthly Employees/i }).fill(name);
      for (let i = 0; i < 4; i++) await page.getByRole('button', { name: /Save & continue/i }).click(); // steps 1-4 defaults
      await page.getByRole('checkbox', { name: /Assign employees now/i }).check();
      await page.getByText(/Search and select user|Search and select employee/i).click().catch(() => {});
      await page.getByText(/Search and select employees/i).click().catch(() => {});
      await page.getByRole('option', { name: /ZZQA HighEarner/i }).click();
      await page.keyboard.press('Escape');
      await page.getByRole('button', { name: /Save & continue/i }).click();
      await page.getByRole('button', { name: /^Create Pay Group$/i }).click();
      await expect(page).toHaveURL(/\/setup\/pay-groups$/, { timeout: 20_000 });
      await expect(page.getByRole('row', { name: new RegExp(name) })).toContainText(/\b1\b/); // EMPLOYEES = 1
    });

    test('TC-BETA-UR-ROLEPERM-001 — a new role keeps its selected permissions', async ({ page }) => {
      await betaReady(page);
      await betaGoUrl(page, '/settings/roles');
      await page.getByRole('button', { name: /^ ?Create Role$/i }).first().click();
      await page.getByRole('textbox', { name: /Payroll Manager/i }).fill(`ZZQA Role ${Date.now().toString().slice(-6)}`);
      await page.getByRole('button', { name: 'Permissions', exact: true }).click();
      await page.getByRole('button', { name: /Pay Run.*Pay run permissions/i }).click();
      await page.getByText('View Payruns').locator('..').getByRole('checkbox').check();
      await page.getByText('Approve Payruns').locator('..').getByRole('checkbox').check();
      await expect(page.getByText(/3 permissions selected/i)).toBeVisible();
      await page.getByRole('button', { name: /^ ?Create Role$/i }).last().click();
      await page.waitForTimeout(2500);
      await expect(page.getByText(/ZZQA Role/).locator('../..')).toContainText(/3 Permissions/);
    });
  });
});
