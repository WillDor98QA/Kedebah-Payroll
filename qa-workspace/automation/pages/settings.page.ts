/**
 * settings.page.ts — PERMANENT Page Object for the Settings hub (/settings). The 10 setup cards.
 * Each card: title, description, status badge (Completed / Optional), and a "View & update"/"Set up" link.
 */
import { Page, expect, Locator } from '@playwright/test';
import { BasePage } from './base.page.js';

export const SETUP_CARDS = [
  'Organization Setup', 'Pay Schedule Setup', 'Tax & Statutory Setup', 'Employee Setup',
  'Bank Setup', 'Finance Posting', 'Earnings, Benefits & Deductions', 'Pay Groups Setup',
  'Users & Roles', 'Approval Setup',
] as const;
export type SetupCard = (typeof SETUP_CARDS)[number];

export class SettingsPage extends BasePage {
  readonly path = '/settings';

  heading() { return this.page.getByText(/Set up your organization and payroll/i); }
  /** The card container matched by its title text. */
  card(title: SetupCard): Locator { return this.page.locator('div').filter({ has: this.page.getByText(title, { exact: true }) }).filter({ has: this.page.getByText(/View & update|Set up/i) }).last(); }
  cardStatus(title: SetupCard): Locator { return this.card(title).getByText(/Completed|Optional/i).first(); }

  /** Open a setup card via the "View & update"/"Set up" action that follows its title in document order. */
  async openCard(title: SetupCard): Promise<void> {
    const titleEl = this.page.getByText(title, { exact: true }).first();
    await titleEl.scrollIntoViewIfNeeded().catch(() => {});
    const action = titleEl.locator('xpath=following::*[contains(normalize-space(.),"View & update") or contains(normalize-space(.),"Set up")][1]');
    await action.click({ timeout: 15000 });
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  async expectLoaded(): Promise<void> { await expect(this.heading()).toBeVisible({ timeout: 20000 }); }
}
