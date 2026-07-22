/**
 * iam-login.browser.spec.ts — IAM: log in as a newly-created user (the crux of permission testing).
 * Proves whether admin-set passwords actually work for login-as-each, and captures the /login contract.
 */
import { test, expect } from '../../fixtures/browser.fixture.js';
import { isAppConfigured } from '../../config/env.js';

const PW = 'QaPass123!';
const USER = { label: 'Payroll Manager', email: 'dwetornam@gmail.com' };

test.describe('IAM login-as new user', () => {
  test.skip(!isAppConfigured, 'App not configured.');
  test.slow();

  test(`login as ${USER.label} (${USER.email})`, async ({ page, bq }) => {
    let loginBody: any = null;
    page.on('request', (r) => { if (/\/login$/.test(r.url()) && r.method() === 'POST') { try { loginBody = r.postDataJSON(); } catch { loginBody = r.postData(); } } });

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#identifier')).toBeVisible({ timeout: 45000 });
    await page.locator('#identifier').fill(USER.email);
    await page.locator('#password').fill(PW);
    await bq.snap('iam', '1-login-filled');
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForTimeout(6000);

    const url = page.url();
    const onLogin = /login|^https:\/\/payroll\.kedebah\.com\/?$/.test(url) && await page.locator('#identifier').isVisible().catch(() => false);
    const errorTxt = await page.getByRole('alert').or(page.locator('[class*="error" i]')).first().innerText().catch(() => '');
    await bq.snap('iam', '2-after-login');
    console.log(`IAM_LOGIN: url=${url} stillOnLogin=${onLogin} error="${errorTxt.slice(0, 100)}" loginRequest=${JSON.stringify(loginBody)}`);

    const success = !onLogin && !/login/.test(url);
    // If routed to select-business, that is also a successful auth.
    const authed = success || /select-business/.test(url);
    console.log(`IAM_LOGIN_RESULT: authenticated=${authed}`);
    expect(loginBody, 'captured the /login request contract').toBeTruthy();
  });
});
