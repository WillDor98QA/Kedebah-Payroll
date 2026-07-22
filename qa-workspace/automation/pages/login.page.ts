/**
 * login.page.ts — Login screen Page Object. PRD §2.
 * Selectors confirmed by recon against the live sandbox (Vue SPA): #identifier, #password,
 * submit button "Sign in". Login posts to /api/v1/payrollApi/login with {with, identifier, password}.
 */

import { Page, expect } from '@playwright/test';
import { BasePage } from './base.page.js';

export class LoginPage extends BasePage {
  readonly path = '/';

  private readonly identifier = () => this.page.locator('#identifier');
  private readonly password = () => this.page.locator('#password');
  private readonly submit = () => this.page.getByRole('button', { name: /sign in/i });
  private readonly error = () => this.page.getByRole('alert').or(this.page.locator('.error, [class*="error" i]'));

  constructor(page: Page) {
    super(page);
  }

  /** Fill credentials and submit. Returns once navigation away from the login form begins. */
  async login(identifier: string, password: string): Promise<void> {
    await this.goto();
    await this.identifier().fill(identifier);
    await this.password().fill(password);
    await this.submit().click();
  }

  async expectLoginError(): Promise<void> {
    await expect(this.error().first()).toBeVisible();
  }
}
