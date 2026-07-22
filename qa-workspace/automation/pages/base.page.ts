/**
 * base.page.ts — shared Page Object base. All page objects extend this.
 * Selector strategy (Test Plan §8): prefer getByRole / getByLabel / data-testid.
 * Where the app lacks stable test ids, log a request to the app team and centralise the brittle
 * selector here so there is a single place to update.
 */

import { Page, Locator, expect } from '@playwright/test';

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  /** Each concrete page sets its route for goto()/assertLoaded(). */
  abstract readonly path: string;

  async goto(): Promise<void> {
    await this.page.goto(this.path);
  }

  byTestId(id: string): Locator {
    return this.page.getByTestId(id);
  }

  async expectToast(text: string | RegExp): Promise<void> {
    // Placeholder selector — confirm the app's toast/notification container.
    await expect(this.page.getByRole('status').filter({ hasText: text })).toBeVisible();
  }

  async expectNoConsoleErrors(errors: string[]): Promise<void> {
    expect(errors, `console errors: ${errors.join(' | ')}`).toHaveLength(0);
  }
}
