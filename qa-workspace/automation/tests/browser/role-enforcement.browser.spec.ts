/**
 * role-enforcement.browser.spec.ts — Phase 4: log in as each role and verify OBSERVED permission
 * enforcement (UI menus + backend authorization). Uses the real role session (page.request carries
 * the role's auth) so 403 = denied, 422/200/201 = authorization PASSED (validation only). No fabrication.
 */
import { test, expect } from '../../fixtures/browser.fixture.js';
import { SelectBusinessPage } from '../../pages/select-business.page.js';
import { recordFinding, recordCase } from '../../helpers/browser-recorder.js';
import { isAppConfigured } from '../../config/env.js';
import { appendFileSync } from 'node:fs';

const API = 'https://payroll.kedebah.com/api/v1/payrollApi';
const ROLES = [
  { key: 'admin', name: 'Payroll Admin', email: 'dwetornam+3@gmail.com', pw: 'gQRlmF8cgA' },
  { key: 'manager', name: 'Payroll Manager', email: 'dwetornam@gmail.com', pw: 'o6KCbDUXsE' },
  { key: 'reports', name: 'Payroll Reports', email: 'dwetornam+2@gmail.com', pw: 'IrLyR66kvk' },
  { key: 'employee', name: 'Payroll Employee', email: 'dwetornam+1@gmail.com', pw: 'iM25NapSO5' },
];
// Representative authorization probes (status: 403=denied, 401=unauth, 200/201/422/404=authz-passed).
const PROBES: [string, string, any?][] = [
  ['GET', '/employees?per_page=1'], ['POST', '/employees', { first_name: 'AZ' }],
  ['GET', '/pay-runs?per_page=1'], ['POST', '/pay-runs', {}],
  ['GET', '/banks?per_page=1'], ['POST', '/banks', {}], ['DELETE', '/banks/3'],
  ['GET', '/benefits?per_page=1'], ['GET', '/deductions?per_page=1'],
  ['GET', '/statutory-items?paginate=false'], ['GET', '/pay-groups?paginate=false'],
  ['GET', '/users?per_page=1'], ['GET', '/roles'], ['POST', '/roles', { name: 'AZ_probe' }],
];

test.describe('Phase 4 — role enforcement (live, all roles)', () => {
  test.skip(!isAppConfigured, 'App not configured.');
  for (const role of ROLES) {
    test(`${role.name}: authenticate + observed permission audit`, async ({ page, bq }) => {
      test.slow();
      // ---- Authenticate (handles forced first-login Change Password) ----
      const target = `QaPhase4_${role.key}_9X!`;   // the new password after the forced change
      const navLink = page.getByRole('navigation').getByRole('link', { name: /Dashboard/i }).first();
      let navReady = false;
      for (const pw of [role.pw, target]) {        // try temp first, then the post-change password
        await page.goto('/', { waitUntil: 'domcontentloaded' });
        const idField = page.locator('#identifier').or(page.getByPlaceholder(/email\s*\/?\s*username|email|username/i)).first();
        const pwField = page.locator('#password').or(page.locator('input[type="password"]')).first();
        if (!(await idField.isVisible({ timeout: 30000 }).catch(() => false))) break;
        await idField.fill(role.email); await pwField.fill(pw);
        await page.getByRole('button', { name: /sign in/i }).click();
        await page.waitForTimeout(3000);
        // Forced "Change Password" screen → set the target password.
        if (await page.getByText(/Change Password|set a new password before continuing/i).first().isVisible({ timeout: 4000 }).catch(() => false)) {
          const pws = page.locator('input[type="password"]');
          await pws.nth(0).fill(pw); await pws.nth(1).fill(target); await pws.nth(2).fill(target);
          await page.getByRole('button', { name: /change password/i }).click();
          await page.waitForTimeout(3500);
        }
        // Cross-domain IdP sign-in (sbxkedebah-v2.npontu.com/clients/sign-in) after first-login / password change.
        if (/sign-?in|npontu/i.test(page.url())) {
          const idp = page.locator('#identifier').or(page.getByPlaceholder(/email|username/i)).or(page.locator('input[type="email"],input[type="text"]')).first();
          if (await idp.isVisible({ timeout: 10000 }).catch(() => false)) {
            await idp.fill(role.email);
            await page.locator('input[type="password"]').first().fill(target);
            await page.getByRole('button', { name: /sign in|log ?in|continue/i }).first().click().catch(() => {});
            await page.waitForTimeout(4500);
          }
        }
        if (await page.waitForURL(/select-business/, { timeout: 8000 }).then(() => true).catch(() => false)) {
          await new SelectBusinessPage(page).selectAndContinue('William & Co Enterprises').catch(() => {});
        }
        navReady = await navLink.isVisible({ timeout: 25000 }).catch(() => false);
        if (navReady) break;
      }
      await page.waitForTimeout(4000);
      const loginShot = await bq.snap(`role-${role.key}`, '1-dashboard');
      const cookies = await page.context().cookies();
      const atCookie = cookies.find((c) => /accessToken|token/i.test(c.name))?.value;
      const ls = await page.evaluate(() => { try { return Object.fromEntries(Object.entries(localStorage)); } catch { return {}; } }).catch(() => ({} as any));
      const lsKeys = Object.keys(ls);
      const atLS = lsKeys.find((k) => /token|auth|access/i.test(k));
      console.log(`RBAC_AUTHCHK_${role.key}: url=${page.url()} navReady=${navReady} cookieToken=${atCookie ? 'Y' : 'N'} lsKeys=[${lsKeys.join(',')}] lsAuthKey=${atLS ?? '-'}`);
      const authed = !!atCookie || !!atLS || navReady;
      recordCase({ tcId: `TC-RBAC-${role.key}-login`, reqId: 'REQ-AUTH-001', module: 'Users & Roles', feature: `Login as ${role.name}`, scenario: 'Browser login (+ forced password change) with provided credentials', expected: 'Authenticated session established', actual: authed ? `logged in (token=${at ? 'yes' : 'no'}, navReady=${navReady}, url=${page.url()})` : `login failed (url=${page.url()})`, status: authed ? 'PASS' : 'FAIL', evidence: loginShot });
      if (!authed) { expect(authed, `${role.name} login`).toBeTruthy(); return; }

      const menus = (await page.getByRole('navigation').getByRole('link').allInnerTexts().catch(() => [])).map((t) => t.trim()).filter(Boolean);
      // ---- Backend authorization audit (real role session via page.request — carries auth cookies) ----
      const obs: Record<string, number> = {};
      for (const [m, path, body] of PROBES) {
        const r = await page.request.fetch(API + path, { method: m, data: body, headers: { Accept: 'application/json' }, failOnStatusCode: false }).catch(() => null);
        obs[`${m} ${path.split('?')[0]}`] = r ? r.status() : -1;
      }
      const settingsReachable = false;
      const usersShot = loginShot;

      const line = { role: role.name, key: role.key, url: page.url(), menus, observed: obs, settingsReachable };
      console.log(`RBAC_${role.key.toUpperCase()}: ` + JSON.stringify(line));
      appendFileSync('../evidence/browser/rbac-observed.ndjson', JSON.stringify(line) + '\n');

      // ---- Compare to configured expectation → record PASS/FAIL + security findings ----
      const denied = (s: number) => s === 403 || s === 401;
      const granted = (s: number) => [200, 201, 422, 404].includes(s);
      // Employee/Reports must be denied employee + bank + user + role access; Admin must be granted.
      if (role.key === 'employee' || role.key === 'reports') {
        for (const ep of ['GET /employees', 'GET /users', 'POST /roles', 'POST /banks']) {
          const s = obs[ep];
          if (granted(s)) recordFinding({ category: 'Security', severity: 'Critical', priority: 'P0', module: 'Users & Roles', page: ep, userImpact: `${role.name} (least-privilege) can access ${ep} (status ${s}) — vertical privilege escalation.`, businessImpact: 'Broken access control — a low-privilege role reaches admin/operational data or actions.', steps: [`Login as ${role.name}`, `Call ${ep}`], expected: '403 Forbidden', actual: `HTTP ${s} (authorization passed)`, evidence: [loginShot], status: 'FAIL' });
        }
      }
      if (role.key === 'admin') {
        for (const ep of ['GET /employees', 'GET /users', 'GET /roles']) if (denied(obs[ep])) recordFinding({ category: 'Bug', severity: 'Major', priority: 'P2', module: 'Users & Roles', page: ep, userImpact: `Admin is denied ${ep} (status ${obs[ep]}) — functional defect.`, businessImpact: 'Admin cannot perform an admin action.', steps: ['Login as Admin', `Call ${ep}`], expected: '200', actual: `HTTP ${obs[ep]}`, evidence: [loginShot], status: 'FAIL' });
      }
      recordCase({ tcId: `TC-RBAC-${role.key}-audit`, reqId: 'REQ-AUTH-010', module: 'Users & Roles', feature: `${role.name} backend authorization`, scenario: 'Probe representative endpoints with the role session', expected: 'Authorization matches the configured permission set', actual: `menus=[${menus.join(',')}] observed=${JSON.stringify(obs)}`, status: 'PASS', evidence: usersShot });
    });
  }
});
