/**
 * _feasibility.browser.spec.ts — M0 decision gate: prove headless Chromium drives the Vue SPA
 * end-to-end (login → multi-tenant select → /settings renders). No assertions of business logic yet;
 * this only verifies the browser harness is viable before building the full Phase-3 framework.
 */
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { LoginPage } from '../../pages/login.page.js';
import { SelectBusinessPage } from '../../pages/select-business.page.js';
import { env, isAppConfigured } from '../../config/env.js';

test.beforeEach(() => { test.skip(!isAppConfigured, 'App URL + admin credentials not configured.'); });

test('M0 feasibility: SPA login renders the Settings page in a real browser', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', (e) => consoleErrors.push(`pageerror: ${e.message}`));

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#identifier')).toBeVisible({ timeout: 45000 });
  await page.locator('#identifier').fill(env.roles.admin.identifier);
  await page.locator('#password').fill(env.roles.admin.password);
  await page.getByRole('button', { name: /sign in/i }).click();
  if (/select-business/.test(page.url()) || (await page.waitForURL(/select-business/, { timeout: 15000 }).then(() => true).catch(() => false))) {
    await new SelectBusinessPage(page).selectAndContinue(env.businessName);
  }
  await page.waitForLoadState('networkidle').catch(() => {});
  const landingUrl = page.url();
  await page.screenshot({ path: '../evidence/browser/_feasibility-landing.png', fullPage: true });
  // Navigate to Settings via the app nav (client-side routing — NOT a hard goto, which loses SPA auth).
  // Nav items are not semantic links/buttons in this SPA — locate by visible text.
  await page.getByRole('navigation').getByRole('link', { name: /Settings/i }).first().click();
  await page.waitForLoadState('networkidle').catch(() => {});
  const settingsRendered = await page.getByText(/Set up your organization|payroll setup/i).first().isVisible({ timeout: 15000 }).catch(() => false);
  await page.screenshot({ path: '../evidence/browser/_feasibility-settings.png', fullPage: true });
  // Prove the a11y tooling runs (record violation count; do not fail the smoke on it).
  const axe = await new AxeBuilder({ page }).analyze().catch((e) => ({ violations: [], _err: String(e) } as any));
  console.log(`FEASIBILITY: landing=${landingUrl} settingsUrl=${page.url()} settingsRendered=${settingsRendered} consoleErrors=${consoleErrors.length} axeViolations=${axe.violations?.length ?? 'n/a'}`);
  console.log('AXE_TOP:', JSON.stringify((axe.violations ?? []).slice(0, 5).map((v: any) => `${v.id}(${v.impact}):${v.nodes.length}`)));
  console.log('CONSOLE_ERRORS:', JSON.stringify(consoleErrors.slice(0, 5)));
  expect(settingsRendered, 'Settings page rendered after nav click').toBeTruthy();
});
