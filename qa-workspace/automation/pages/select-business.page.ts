/**
 * select-business.page.ts — multi-tenant business selection. (Not in PRD — discovered via recon.)
 * After login the app routes to /select-business; you pick a business card then click Continue,
 * which re-authenticates with an encrypted `business_account` token and enters that tenant.
 * NOTE: permissions are per-business — the admin account is only authorized on specific businesses.
 */

import { Page, expect } from '@playwright/test';
import { BasePage } from './base.page.js';

export class SelectBusinessPage extends BasePage {
  readonly path = '/select-business';

  async selectAndContinue(businessName: string): Promise<void> {
    await expect(this.page).toHaveURL(/select-business/, { timeout: 15000 });
    // Card text concatenates name + email; a text match on the name selects the right card.
    await this.page.getByText(new RegExp(escapeRegex(businessName), 'i')).first().click();
    await this.page.getByRole('button', { name: /continue/i }).click();
    await this.page.waitForLoadState('networkidle');
  }

  /** True if this account is forbidden on the chosen business (lands on /forbidden). */
  async isForbidden(): Promise<boolean> {
    return /forbidden/i.test(this.page.url());
  }
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\&]/g, '.');
}
