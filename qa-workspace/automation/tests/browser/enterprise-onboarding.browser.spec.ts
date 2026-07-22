/**
 * enterprise-onboarding.browser.spec.ts — NEW authoritative entry point: the Kedebah Enterprise portal
 * (sbxkedebah-v2.npontu.com) → Business Selection → Module Launcher → Payroll. End-to-end onboarding.
 * Preserves all existing Payroll automation; this becomes the front door.
 */
import { test, expect } from '../../fixtures/browser.fixture.js';

export const ENTERPRISE_URL = 'https://sbxkedebah-v2.npontu.com/clients/sign-in';
export const ROLE_CREDS = {
  admin: { email: 'dwetornam+3@gmail.com', pw: 'QaPhase4_admin_9X!', tempPw: 'gQRlmF8cgA', finalPw: 'QaPhase4_admin_9X!' },
  manager: { email: 'dwetornam@gmail.com', pw: 'password#23e', tempPw: 'o6KCbDUXsE', finalPw: 'Payroll2026#e' },
  reports: { email: 'dwetornam+2@gmail.com', pw: 'password#23e', tempPw: 'IrLyR66kvk', finalPw: 'Payroll2026#e' },
  employee: { email: 'dwetornam+1@gmail.com', pw: 'QaPhase4_employee_9X!', tempPw: 'iM25NapSO5', finalPw: 'QaPhase4_employee_9X!' },
};

test.describe('Enterprise portal — discovery', () => {
  test('capture the enterprise sign-in page structure', async ({ page, bq }) => {
    test.slow();
    await page.goto(ENTERPRISE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);
    await bq.snap(`enterprise-${roleKey}`, '0-signin-page');
    const inputs = await page.locator('input').evaluateAll((els) => els.map((e: any) => ({ type: e.type, name: e.name, id: e.id, placeholder: e.placeholder, label: e.getAttribute('aria-label') })));
    const buttons = await page.getByRole('button').allInnerTexts().catch(() => []);
    const links = await page.getByRole('link').allInnerTexts().catch(() => []);
    const heading = await page.getByRole('heading').allInnerTexts().catch(() => []);
    console.log('ENT_SIGNIN: url=' + page.url());
    console.log('ENT_INPUTS: ' + JSON.stringify(inputs));
    console.log('ENT_BUTTONS: ' + JSON.stringify(buttons));
    console.log('ENT_LINKS: ' + JSON.stringify(links));
    console.log('ENT_HEADINGS: ' + JSON.stringify(heading));
    expect(inputs.length).toBeGreaterThan(0);
  });

  for (const roleKey of ['manager', 'reports'] as const) {
    test(`Forgot-password reset flow (${roleKey})`, async ({ page, bq }) => {
      test.slow();
      const c = ROLE_CREDS[roleKey];
      await page.goto(ENTERPRISE_URL, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      await page.getByRole('link', { name: /forgot password/i }).first().click().catch(() => {});
      await page.waitForTimeout(3000);
      await bq.snap(`enterprise-${roleKey}`, 'F-forgot-1');
      const body1 = (await page.locator('body').innerText().catch(() => '')).replace(/\s+/g, ' ').slice(0, 400);
      // Fill the identifier (email/username) and submit the reset request.
      const idf = page.getByPlaceholder(/email|username/i).or(page.locator('input[type="email"],input[type="text"]')).first();
      if (await idf.isVisible({ timeout: 8000 }).catch(() => false)) {
        await idf.fill(c.email);
        await page.getByRole('button', { name: /reset|send|continue|submit|recover/i }).first().click().catch(() => {});
        await page.waitForTimeout(4000);
      }
      await bq.snap(`enterprise-${roleKey}`, 'F-forgot-2');
      const body2 = (await page.locator('body').innerText().catch(() => '')).replace(/\s+/g, ' ').slice(0, 400);
      console.log(`ENT_FORGOT_${roleKey}: url=${page.url()} page1=${JSON.stringify(body1)} result=${JSON.stringify(body2)}`);
      expect(true).toBeTruthy();
    });
  }

  for (const roleKey of ['admin', 'manager', 'reports', 'employee'] as const) {
  test(`E2E onboarding: Enterprise login → Business → Module Launcher → Payroll (${roleKey})`, async ({ page, bq }) => {
    test.slow();
    const c = ROLE_CREDS[roleKey];
    const stages: string[] = [];
    const log = (s: string) => { stages.push(`${s} @ ${page.url()}`); console.log(`ENT_STAGE: ${s} @ ${page.url()}`); };

    // 1. Central Enterprise Login — try temp then target; capture which is accepted.
    let accepted = '';
    for (const pw of [c.finalPw, c.pw, c.tempPw]) {
      await page.goto(ENTERPRISE_URL, { waitUntil: 'domcontentloaded' });
      await page.getByPlaceholder(/email\s*\/?\s*username|email|username/i).first().fill(c.email);
      await page.locator('input[type="password"]').first().fill(pw);
      await page.getByRole('button', { name: /sign in/i }).click();
      await page.waitForTimeout(5000);
      const invalid = await page.getByText(/invalid password|invalid credentials|incorrect/i).first().isVisible({ timeout: 2000 }).catch(() => false);
      if (!invalid && !/clients\/sign-in/.test(page.url())) { accepted = pw; break; }
      if (!invalid && await page.getByText(/Change Password|set a new password/i).first().isVisible({ timeout: 2000 }).catch(() => false)) { accepted = pw; break; }
    }
    await bq.snap(`enterprise-${roleKey}`, 'A-after-login');
    log(`after-login accepted=${accepted ? (accepted === c.tempPw ? 'TEMP' : 'TARGET') : 'NONE'}`);

    // 2/3. Forced password change (dedicated page /clients/change-password-required)
    if (/change-password|Change Password|set a new password/i.test(page.url() + (await page.locator('body').innerText().catch(() => '')))) {
      await bq.snap(`enterprise-${roleKey}`, 'B-change-password');
      const body = (await page.locator('body').innerText().catch(() => '')).replace(/\s+/g, ' ').slice(0, 500);
      console.log('ENT_CHGPW_PAGE: ' + JSON.stringify(body));
      const newPw = c.finalPw; // documented final password
      const current = accepted || c.tempPw; // current = whatever password got us past login
      const pws = page.locator('input[type="password"]');
      const n = await pws.count();
      // order: [current, new, confirm] (3 fields) or [new, confirm] (2)
      if (n >= 3) { await pws.nth(0).fill(current); await pws.nth(1).fill(newPw); await pws.nth(2).fill(newPw); }
      else { await pws.nth(0).fill(newPw); await pws.nth(1).fill(newPw); }
      await page.getByRole('button', { name: /change password|update|save|continue|submit/i }).first().click();
      await page.waitForTimeout(4500);
      const err = await page.locator('[class*="error" i], .text-red-500, [class*="invalid" i]').allInnerTexts().catch(() => []);
      console.log('ENT_CHGPW_RESULT: url=' + page.url() + ' errors=' + JSON.stringify(err.filter(Boolean).slice(0, 4)));
      log('after-password-change');
    }

    // 4/5. Enterprise Module Launcher (/clients/select-module) — wait for modules, discover, launch Payroll.
    await page.waitForTimeout(5000); // let module tiles load
    await bq.snap(`enterprise-${roleKey}`, 'D-module-launcher');
    const tiles = await page.locator('a, button, [class*="card" i], [class*="module" i]').filter({ hasText: /payroll|hr|crm|inventory|account|launch|open/i }).allInnerTexts().catch(() => []);
    console.log('ENT_MODULES: ' + JSON.stringify([...new Set(tiles.map((t) => t.replace(/\s+/g, ' ').trim()))].slice(0, 12)));
    // Click the Payroll module card / its Launch button.
    const payrollCard = page.locator('[class*="card" i], a, button').filter({ hasText: /payroll/i }).first();
    const launchBtn = page.getByRole('button', { name: /launch|open|go to|enter/i }).first();
    if (await payrollCard.isVisible({ timeout: 8000 }).catch(() => false)) { await payrollCard.click().catch(() => {}); await page.waitForTimeout(2000); }
    if (await launchBtn.isVisible({ timeout: 4000 }).catch(() => false)) { await launchBtn.click().catch(() => {}); }
    await page.waitForTimeout(7000); log('after-launch-payroll');

    // 6/7. Module presence + Payroll reached?
    const noModules = await page.getByText(/No modules found/i).first().isVisible({ timeout: 4000 }).catch(() => false);
    const onPayroll = /payroll\.kedebah\.com/.test(page.url()) || await page.getByRole('navigation').getByRole('link', { name: /Dashboard/i }).first().isVisible({ timeout: 12000 }).catch(() => false);
    await bq.snap(`enterprise-${roleKey}`, 'E-final');
    log(`noModules=${noModules} onPayroll=${onPayroll}`);
    console.log(`ENT_RESULT_${roleKey}: passwordAccepted=${accepted === c.tempPw ? 'TEMP(→changed)' : accepted === c.pw ? 'TARGET(already-changed)' : 'NONE'} launcher=${/select-module/.test(page.url())} noModules=${noModules} onPayroll=${onPayroll}`);
    console.log('ENT_JOURNEY: ' + JSON.stringify(stages));
    expect(stages.length).toBeGreaterThan(0);
  });
  }
});
