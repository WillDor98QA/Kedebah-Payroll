/**
 * app-shell.page.ts — PERMANENT Page Object for the authenticated SPA shell (top nav + top bar).
 * Encapsulates the navigation rules proven in M0: nav items are real <a> links with icon+text
 * accessible names; navigate by role+name (NOT hard goto, which drops the in-memory session).
 * ensureReady() makes a test resilient whether storageState carried auth or not.
 */
import { Page, expect } from '@playwright/test';
import { BasePage } from './base.page.js';
import { LoginPage } from './login.page.js';
import { SelectBusinessPage } from './select-business.page.js';
import { env } from '../config/env.js';

const NAV = ['Dashboard', 'Employees', 'Run Payroll', 'Taxes & Forms', 'Reports', 'Settings'] as const;
export type NavItem = (typeof NAV)[number];

export class AppShell extends BasePage {
  readonly path = '/dashboard';
  private nav() { return this.page.getByRole('navigation'); }

  /** Land in the authenticated app shell regardless of stored-state validity (resilient to slow SPA load). */
  async ensureReady(): Promise<void> {
    await this.page.goto('/', { waitUntil: 'domcontentloaded' });
    const navLink = this.nav().getByRole('link', { name: /Dashboard/i }).first();
    const login = this.page.locator('#identifier');
    const deadline = Date.now() + 50000;
    while (Date.now() < deadline) {
      if (await navLink.isVisible().catch(() => false)) return; // already in the app
      if (/select-business/.test(this.page.url())) {
        // Tolerant selection: pick the business card, click Continue if it's present (the app may auto-advance).
        await this.page.getByText(new RegExp(env.businessName.replace(/[.*+?^${}()|[\]\\&]/g, '.'), 'i')).first().click({ timeout: 8000 }).catch(() => {});
        await this.page.getByRole('button', { name: /continue/i }).click({ timeout: 6000 }).catch(() => {});
        await this.page.waitForLoadState('networkidle').catch(() => {});
        continue;
      }
      if (await login.isVisible().catch(() => false)) {
        await login.fill(env.roles.admin.identifier);
        await this.page.locator('#password').fill(env.roles.admin.password);
        await this.page.getByRole('button', { name: /sign in/i }).click();
        await this.page.waitForLoadState('networkidle').catch(() => {});
        continue;
      }
      await this.page.waitForTimeout(1000);
    }
    await expect(navLink, 'app shell did not become ready within 50s').toBeVisible();
  }

  /** Client-side navigate to a top-nav module and wait for the route to settle. */
  async go(item: NavItem): Promise<void> {
    await this.nav().getByRole('link', { name: new RegExp(item.replace(/&/g, '&'), 'i') }).first().click();
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  topBarIconButtons() { return this.page.locator('header button, [class*="header" i] button, [class*="topbar" i] button'); }
  search() { return this.page.getByPlaceholder(/search anything/i); }
  userMenu() { return this.page.getByText(/^PM$/).first(); }
}
