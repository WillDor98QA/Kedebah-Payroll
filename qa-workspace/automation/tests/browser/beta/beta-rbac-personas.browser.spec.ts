/**
 * beta-rbac-personas.browser.spec.ts — PERMANENT regression asset.
 *
 * Per-role access surface for the non-admin QA personas, reverse-engineered live on BETA 2026-09-09
 * (see reports/BETA-REGRESSION-INDEX.md · TC-BETA-RBAC-*).
 *
 * Persona → role (users created in Phase 3d, invitation passwords completed by the account holder):
 *   BETA_MANAGER   dwetornam+23  → Payroll Manager  (approval workflow stage 1)
 *   BETA_EMPLOYEE  dwetornam+24  → Payroll Employee
 *   BETA_REPORT    dwetornam+25  → Payroll Reports
 *   BETA_ADMINNEW  dwetornam+26  → Payroll Admin    (approval workflow stage 2)
 *
 * Findings asserted here (written to flip green when fixed):
 *   BETA-F-033 (Major) — /setup/* routes are NOT behind the role guard that protects /settings.
 *                        A Payroll Employee / Reports persona can open /setup/budgets, /setup/banks,
 *                        /setup/pay-groups, /setup/statutory-rules — pages + their Create/Add buttons
 *                        render; only the final write is blocked server-side.
 *
 * Confirmed-good behaviour (plain PASS):
 *   - nav for Employee/Reports is limited to Dashboard + Reports
 *   - /payroll, /employees, /taxes, /settings, /settings/roles → /forbidden
 *   - a write attempt (Create Budget) → "You do not have permission to perform this action"
 *   - GET /organization-data → 403 for these personas
 *
 * NOTE: unlike the admin specs, a hard page.goto() of a deep route is SAFE for these personas —
 * the SSO re-exchange restores the in-memory session (verified 2026-09-09). betaReadyAs still uses
 * the portal → module launcher hand-off for the initial login.
 */
import { test, expect } from '../../../fixtures/browser.fixture.js';
import { betaReadyAs } from './_beta-shell.js';
import { env, isBetaConfigured } from '../../../config/env.js';

const B = env.beta;
const configured = (c: { identifier: string; password: string }) => !!c.identifier && !!c.password;

test.describe('BETA · RBAC — non-admin personas', () => {
  test.skip(!isBetaConfigured, 'BETA_* not configured.');
  test.slow();

  for (const [label, creds] of [
    ['Payroll Employee', B.employee],
    ['Payroll Reports', B.report],
  ] as const) {
    test.describe(label, () => {
      test.skip(!configured(creds), `${label} persona credentials not configured.`);

      test(`${label} — nav is Dashboard + Reports only; privileged routes 403`, async ({ page }) => {
        await betaReadyAs(page, creds);

        const navItems = await page.getByRole('navigation').getByRole('link').allInnerTexts();
        const norm = navItems.map((t) => t.trim()).filter(Boolean).sort();
        expect(norm).toEqual(['Dashboard', 'Reports']);

        for (const route of ['/payroll', '/employees', '/taxes', '/settings', '/settings/roles']) {
          await page.goto(`${B.payrollURL}${route}`);
          await expect(page, `${route} must be denied for ${label}`).toHaveURL(/\/forbidden/, { timeout: 30_000 });
          await expect(page.getByText(/Access Denied/i)).toBeVisible();
        }
      });

      test(`${label} — /setup/* routes render without the permission [FAILS today: BETA-F-033]`, async ({ page }) => {
        await betaReadyAs(page, creds);

        // Expectation once fixed: these behave like /settings (redirect to /forbidden).
        for (const route of ['/setup/budgets', '/setup/banks', '/setup/pay-groups', '/setup/statutory-rules']) {
          await page.goto(`${B.payrollURL}${route}`);
          await page.waitForLoadState('networkidle').catch(() => {});
          await expect(page, `BETA-F-033: ${route} should be guarded for ${label}`).toHaveURL(/\/forbidden/, { timeout: 30_000 });
        }
      });

      test(`${label} — a write attempt is rejected server-side`, async ({ page }) => {
        await betaReadyAs(page, creds);
        await page.goto(`${B.payrollURL}/setup/budgets`);
        await page.waitForLoadState('networkidle').catch(() => {});

        // The button renders (BETA-F-033) but the write must fail.
        const createBtn = page.getByRole('button', { name: /^\s*Create Budget\s*$/i }).first();
        test.skip(!(await createBtn.isVisible().catch(() => false)), 'Create Budget not shown (BETA-F-033 may be fixed).');
        await createBtn.click();
        await page.getByRole('textbox', { name: /FY2026 Payroll Budget/i }).fill(`ZZQA RBAC ${Date.now().toString().slice(-6)}`);
        await page.getByRole('row', { name: /Jan/ }).getByPlaceholder('0.00').fill('1000');
        await page.getByRole('button', { name: /^Create Budget$/ }).last().click();
        await expect(page.getByText(/do not have permission to perform this action/i)).toBeVisible({ timeout: 15_000 });
      });
    });
  }

  test('Payroll Employee — Reports Centre is fully readable (org-wide figures, not self-service)', async ({ page }) => {
    test.skip(!configured(B.employee), 'Payroll Employee persona credentials not configured.');
    await betaReadyAs(page, B.employee);
    // Documents current behaviour: a "Payroll Employee" sees the whole-org Reports Centre.
    // If the product later restricts this role to self-service, flip this to expect /forbidden.
    await page.goto(`${B.payrollURL}/reports`);
    await page.waitForLoadState('networkidle').catch(() => {});
    await expect(page).not.toHaveURL(/\/forbidden/);
    await expect(page.getByRole('heading', { name: /Reports Centre/i })).toBeVisible({ timeout: 30_000 });
    await expect(page.getByText(/Payroll Summary/i).first()).toBeVisible();
  });
});
