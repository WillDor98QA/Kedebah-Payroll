/**
 * _beta-shell.ts — PERMANENT helper for tests/browser/beta/*.browser.spec.ts.
 *
 * The BETA product is the enterprise portal (v2.kedebahlite.com) → module launcher → Payroll Manager
 * (v2payroll.kedebahlite.com). Auth lives in memory after the module hand-off, so — exactly like the
 * prior sandbox — a hard goto() of a deep payroll route bounces to login. Always: fresh login →
 * pick business → click into Payroll Manager → navigate inside the payroll app via link clicks.
 *
 * Drives the flow that was reverse-engineered live on 2026-09-08/09 (reports/BETA-01-feasibility-map.md).
 * Cold loads on beta are slow (8–30 s skeleton — BETA-F-002), so timeouts here are generous.
 */
import { expect, type Page } from '@playwright/test';
import { env } from '../../../config/env.js';

const B = env.beta;

export type BetaCreds = { identifier: string; password: string };

/** Log in at the enterprise client portal as a given persona (default: admin). Fails loudly on a forced password change. */
export async function betaLoginAs(page: Page, creds: BetaCreds = B.admin): Promise<void> {
  await page.goto(B.baseURL, { waitUntil: 'domcontentloaded' });
  await page.getByRole('textbox', { name: /Email\/Username/i }).fill(creds.identifier);
  await page.getByRole('textbox', { name: /Password/i }).fill(creds.password);
  await page.getByRole('button', { name: /^Sign In/i }).click();

  // Enterprise flow may interpose a forced password change — that's a provisioning task, not a test path.
  await page.waitForURL(/select-module|change-password-required/i, { timeout: 60_000 });
  expect(page.url(), 'forced password-change screen — provision the account first').not.toMatch(/change-password-required/i);
}

/** Log in at the enterprise client portal as the admin persona. */
export async function betaLogin(page: Page): Promise<void> {
  await betaLoginAs(page, B.admin);
}

/** From the module launcher, confirm the business and open Payroll Manager; land on the payroll dashboard. */
export async function betaOpenPayroll(page: Page): Promise<void> {
  await expect(page.getByRole('heading', { name: /Enterprise Modules/i })).toBeVisible({ timeout: 45_000 });

  // Business selector shows the current business; switch only if it isn't the target.
  const current = page.getByRole('button', { name: /Current Business/i });
  if (await current.isVisible().catch(() => false)) {
    const label = (await current.innerText().catch(() => '')) || '';
    if (!label.includes(B.business)) {
      await current.click();
      await page.getByRole('option', { name: new RegExp(B.business, 'i') }).click().catch(() => {});
    }
  }

  await page.getByRole('heading', { name: /^Payroll Manager$/i }).click();
  await page.waitForURL(/v2payroll\.kedebahlite\.com\/dashboard/i, { timeout: 90_000 });
  await expect(page.getByRole('heading', { name: /Payroll Dashboard/i })).toBeVisible({ timeout: 45_000 });
}

/** Full "ready to test" entry point: login → pick business → open payroll. */
export async function betaReady(page: Page): Promise<void> {
  await betaLogin(page);
  await betaOpenPayroll(page);
}

/** As betaReady but for a specific persona (RBAC specs). Non-privileged personas still land on /dashboard. */
export async function betaReadyAs(page: Page, creds: BetaCreds): Promise<void> {
  await betaLoginAs(page, creds);
  await betaOpenPayroll(page);
}

/** Client-side nav inside the payroll app (never hard-goto a deep route). */
export async function betaGo(page: Page, item: 'Dashboard' | 'Employees' | 'Run Payroll' | 'Taxes & Forms' | 'Reports' | 'Settings'): Promise<void> {
  await page.getByRole('navigation').getByRole('link', { name: new RegExp(item, 'i') }).first().click();
  await page.waitForLoadState('networkidle').catch(() => {});
}

/** A payroll-app route reached by client-side routing after betaReady (safe for setup sub-pages). */
export async function betaGoUrl(page: Page, path: string): Promise<void> {
  // Use in-app history navigation so the in-memory business token survives.
  await page.evaluate((p) => window.history.pushState({}, '', p), path);
  await page.evaluate(() => window.dispatchEvent(new PopStateEvent('popstate')));
  await page.waitForLoadState('networkidle').catch(() => {});
}
