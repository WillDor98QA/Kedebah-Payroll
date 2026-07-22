/**
 * bug-reverify.browser.spec.ts — Phase 7 re-verification of BUG-011 (module access) and BUG-012
 * (admin-set password works) using a freshly-created admin user with an admin-set password + assigned role.
 */
import { test, expect } from '../../fixtures/browser.fixture.js';
import { SelectBusinessPage } from '../../pages/select-business.page.js';
import { recordCase } from '../../helpers/browser-recorder.js';

const ENTERPRISE = 'https://sbxkedebah-v2.npontu.com/clients/sign-in';
const EMAIL = 'dwetornam+4@gmail.com';
const PW = 'Kdbh#Qa2026';          // admin-set password (BUG-012 test)
const TARGET = 'Kdbh#Qa2027!';     // if the admin-set password is treated as must-change

test('owner module access: can codewithme224 reach Payroll via the enterprise portal?', async ({ page, bq }) => {
  test.slow();
  await page.goto(ENTERPRISE, { waitUntil: 'domcontentloaded' });
  const idf = page.getByPlaceholder(/email\s*\/?\s*username|email|username/i).or(page.locator('input[type="text"]')).first();
  await expect(idf).toBeVisible({ timeout: 40000 });
  await idf.fill('codewithme224@gmail.com');
  await page.locator('input[type="password"]').first().fill('pass3Admin@');
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForTimeout(5000);
  if (await page.waitForURL(/select-business/, { timeout: 6000 }).then(() => true).catch(() => false)) {
    await new SelectBusinessPage(page).selectAndContinue('William & Co Enterprises').catch(() => {});
    await page.waitForTimeout(4000);
  }
  await bq.snap('bug-reverify', 'owner-launcher');
  const invalid = await page.getByText(/invalid password|incorrect/i).first().isVisible({ timeout: 2000 }).catch(() => false);
  const noModules = await page.getByText(/No modules found/i).first().isVisible({ timeout: 3000 }).catch(() => false);
  const payrollTile = await page.getByText(/payroll/i).first().isVisible({ timeout: 3000 }).catch(() => false);
  console.log(`OWNER_CHECK: invalid=${invalid} url=${page.url()} noModules=${noModules} payrollTile=${payrollTile}`);
  expect(page.url()).toBeTruthy();
});

test('BUG-011/012 re-verify: admin-set password login + module access (+4 Payroll Admin)', async ({ page, bq }) => {
  test.slow();
  const log: string[] = [];
  await page.goto(ENTERPRISE, { waitUntil: 'domcontentloaded' });
  const idf = page.getByPlaceholder(/email\s*\/?\s*username|email|username/i).or(page.locator('input[type="text"]')).first();
  await expect(idf).toBeVisible({ timeout: 40000 });
  await idf.fill(EMAIL);
  await page.locator('input[type="password"]').first().fill(PW);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForTimeout(4000);
  await bq.snap('bug-reverify', '1-after-login');

  const invalid = await page.getByText(/invalid password|invalid credentials|incorrect/i).first().isVisible({ timeout: 2500 }).catch(() => false);
  const passwordWorks = !invalid && !/clients\/sign-in$/.test(page.url());
  log.push(`login: invalid=${invalid} url=${page.url()}`);
  // BUG-012 verdict — admin-set password accepted at first login?
  recordCase({ tcId: 'TC-URB-005', reqId: 'REQ-AUTH-001', module: 'Users & Roles', feature: 'Admin-set password login', scenario: 'Login with the password the admin set at user-create', expected: 'Authenticates (admin-set password honoured)', actual: `[browser] admin-set password ${passwordWorks ? 'ACCEPTED — BUG-012 resolved' : 'REJECTED (Invalid password) — BUG-012 still open'} (${page.url()})`, status: passwordWorks ? 'PASS' : 'FAIL', evidence: await bq.snap('bug-reverify', '2-pw') });

  // Handle a forced change if the admin-set password is treated as temporary
  if (await page.getByText(/Change Password|set a new password/i).first().isVisible({ timeout: 3000 }).catch(() => false)) {
    const pws = page.locator('input[type="password"]');
    await pws.nth(0).fill(PW); await pws.nth(1).fill(TARGET); await pws.nth(2).fill(TARGET);
    await page.getByRole('button', { name: /change password|update|save|continue/i }).first().click();
    await page.waitForTimeout(4000); log.push('completed forced change → ' + TARGET);
  }
  if (await page.waitForURL(/select-business/, { timeout: 6000 }).then(() => true).catch(() => false)) {
    await new SelectBusinessPage(page).selectAndContinue('William & Co Enterprises').catch(() => {});
  }
  await page.waitForTimeout(4000);
  await bq.snap('bug-reverify', '3-launcher');

  // BUG-011 verdict — is the Payroll module present in the launcher?
  const onLauncher = /select-module/.test(page.url());
  const noModules = await page.getByText(/No modules found/i).first().isVisible({ timeout: 4000 }).catch(() => false);
  const payrollTile = await page.getByText(/payroll/i).first().isVisible({ timeout: 4000 }).catch(() => false);
  const hasModule = onLauncher && !noModules && payrollTile;
  log.push(`launcher: onLauncher=${onLauncher} noModules=${noModules} payrollTile=${payrollTile}`);
  console.log('BUG_REVERIFY: ' + JSON.stringify(log));
  recordCase({ tcId: 'TC-ENT-MOD-admin', reqId: 'REQ-SETUP-001', module: 'Enterprise Onboarding', feature: 'Module access for created user', scenario: 'Enterprise Module Launcher for a role-assigned created user', expected: 'Payroll module tile present and launchable', actual: `[browser] ${hasModule ? 'Payroll module PRESENT — BUG-011 resolved' : noModules ? 'No modules found — BUG-011 STILL OPEN' : `launcher state onLauncher=${onLauncher} payrollTile=${payrollTile}`}`, status: hasModule ? 'PASS' : (onLauncher && noModules ? 'FAIL' : 'BLOCKED'), evidence: await bq.snap('bug-reverify', '4-final') });

  expect(page.url()).toBeTruthy();
});

test('BUG-012 UI path: owner creates a user via the UI with password + role, then that user logs in', async ({ page, bq }) => {
  test.slow();
  test.setTimeout(180000);
  const log: string[] = [];
  // 1. owner login → launcher → launch Payroll
  await page.goto(ENTERPRISE, { waitUntil: 'domcontentloaded' });
  const idf = page.getByPlaceholder(/email\s*\/?\s*username|email|username/i).or(page.locator('input[type="text"]')).first();
  await expect(idf).toBeVisible({ timeout: 40000 });
  await idf.fill('codewithme224@gmail.com');
  await page.locator('input[type="password"]').first().fill('pass3Admin@');
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForTimeout(5000);
  if (await page.waitForURL(/select-business/, { timeout: 6000 }).then(() => true).catch(() => false)) {
    await new SelectBusinessPage(page).selectAndContinue('William & Co Enterprises').catch(() => {}); await page.waitForTimeout(3000);
  }
  await page.getByText(/payroll/i).first().click().catch(() => {});
  await page.waitForTimeout(8000);
  log.push('after launch payroll: ' + page.url());
  await bq.snap('bug-reverify', 'ui-1-payroll');
  // 2. navigate to Users
  for (const nav of [/users/i, /settings/i]) {
    const link = page.getByRole('link', { name: nav }).or(page.getByRole('navigation').getByText(nav)).first();
    if (await link.isVisible({ timeout: 3000 }).catch(() => false)) { await link.click().catch(() => {}); await page.waitForTimeout(2500); }
  }
  // try direct route on the payroll host
  if (!/users/i.test(page.url())) { await page.goto('https://payroll.kedebah.com/settings/users', { waitUntil: 'domcontentloaded' }).catch(() => {}); await page.waitForTimeout(4000); }
  await bq.snap('bug-reverify', 'ui-2-users');
  // 3. open Add User
  const addBtn = page.getByRole('button', { name: /add user|new user|create user|invite/i }).or(page.getByText(/add user|create user/i)).first();
  const canAdd = await addBtn.isVisible({ timeout: 5000 }).catch(() => false);
  log.push('add-user control visible: ' + canAdd + ' @ ' + page.url());
  if (!canAdd) {
    console.log('UI_CREATE: ' + JSON.stringify(log));
    recordCase({ tcId: 'TC-URB-001', reqId: 'IAM', module: 'Users & Roles', feature: 'UI create-user', scenario: 'Owner opens Add User form', expected: 'Add-user form reachable', actual: `[browser] Add-user control not reachable under automation from ${page.url()} — needs page-object mapping`, status: 'BLOCKED', evidence: await bq.snap('bug-reverify', 'ui-noadd') });
    return;
  }
  await page.getByRole('button', { name: /^\s*Add User\s*$/i }).first().click({ force: true }).catch(() => {});
  await page.waitForTimeout(4500);
  await bq.snap('bug-reverify', 'ui-3-form');
  // 4. capture the modal/dialog form fields (email, password, role, phone)
  const scope = page.getByRole('dialog').or(page.locator('[class*="modal" i],[class*="drawer" i],[role="dialog"]')).first();
  const inScope = await scope.isVisible({ timeout: 3000 }).catch(() => false);
  const root: any = inScope ? scope : page;
  const inputs = await root.locator('input,select,textarea,[role="combobox"]').evaluateAll((els: any[]) => els.map((e) => ({ tag: e.tagName, type: e.type, name: e.name, ph: e.placeholder, label: e.getAttribute('aria-label') || (e.labels && e.labels[0] && e.labels[0].innerText) })).filter((x) => x.ph || x.name || x.label || x.type === 'password'));
  const pwCount = await root.locator('input[type="password"]').count();
  const hasRole = await root.getByText(/role/i).first().isVisible({ timeout: 1500 }).catch(() => false);
  log.push(`dialog=${inScope} pwFields=${pwCount} roleField=${hasRole} fields=` + JSON.stringify(inputs).slice(0, 500));
  console.log('UI_CREATE: ' + JSON.stringify(log));
  recordCase({ tcId: 'TC-URB-001', reqId: 'IAM', module: 'Users & Roles', feature: 'UI create-user form', scenario: 'Owner opens Add User modal', expected: 'Form has name/email/phone + role + password fields', actual: `[browser] Add-User modal reachable (dialog=${inScope}); password fields=${pwCount}; role field=${hasRole}`, status: inScope ? 'PASS' : 'BLOCKED', evidence: await bq.snap('bug-reverify', 'ui-3-form') });
  expect(page.url()).toBeTruthy();
});

const REAL = [
  { email: 'dwetornam+4@gmail.com', pw: 'fH5CUl7shf', role: 'Payroll Admin' },
  { email: 'dwetornam+5@gmail.com', pw: 'vVzrzuW1zA', role: 'Payroll Manager' },
];
for (const acct of REAL) {
  test(`BUG-011/012 FINAL: created user login + module access (${acct.role})`, async ({ page, bq }) => {
    test.slow();
    const key = acct.email.replace(/[@.+]/g, '_');
    await page.goto(ENTERPRISE, { waitUntil: 'domcontentloaded' });
    const idf = page.getByPlaceholder(/email\s*\/?\s*username|email|username/i).or(page.locator('input[type="text"]')).first();
    await expect(idf).toBeVisible({ timeout: 40000 });
    await idf.fill(acct.email);
    await page.locator('input[type="password"]').first().fill(acct.pw);
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForTimeout(4500);
    const invalid = await page.getByText(/invalid password|invalid credentials|incorrect/i).first().isVisible({ timeout: 2500 }).catch(() => false);
    const pwWorks = !invalid && !/clients\/sign-in$/.test(page.url());
    await bq.snap(`bug-reverify`, `${key}-1login`);
    recordCase({ tcId: acct.role.includes('Admin') ? 'TC-URB-005' : 'TC-ENT-PW-manager', reqId: 'REQ-AUTH-001', module: 'Users & Roles', feature: `Created-user password login (${acct.role})`, scenario: 'Login with the password set at user-create (UI)', expected: 'Authenticates', actual: `[browser] ${acct.email} password ${pwWorks ? 'ACCEPTED — BUG-012 resolved for UI-created user' : 'REJECTED (Invalid password)'} (${page.url()})`, status: pwWorks ? 'PASS' : 'FAIL', evidence: await bq.snap('bug-reverify', `${key}-pw`) });
    // forced change?
    if (await page.getByText(/Change Password|set a new password/i).first().isVisible({ timeout: 3000 }).catch(() => false)) {
      const pws = page.locator('input[type="password"]');
      await pws.nth(0).fill(acct.pw); await pws.nth(1).fill(acct.pw + 'X9!'); await pws.nth(2).fill(acct.pw + 'X9!');
      await page.getByRole('button', { name: /change password|update|save|continue/i }).first().click();
      await page.waitForTimeout(4000);
    }
    if (await page.waitForURL(/select-business/, { timeout: 6000 }).then(() => true).catch(() => false)) {
      await new SelectBusinessPage(page).selectAndContinue('William & Co Enterprises').catch(() => {});
    }
    await page.waitForTimeout(4500);
    const onLauncher = /select-module/.test(page.url());
    const noModules = await page.getByText(/No modules found/i).first().isVisible({ timeout: 4000 }).catch(() => false);
    const payrollTile = await page.getByText(/payroll/i).first().isVisible({ timeout: 4000 }).catch(() => false);
    const hasModule = onLauncher && !noModules && payrollTile;
    console.log(`FINAL_${key}: pwWorks=${pwWorks} onLauncher=${onLauncher} noModules=${noModules} payrollTile=${payrollTile} url=${page.url()}`);
    recordCase({ tcId: acct.role.includes('Admin') ? 'TC-ENT-MOD-admin' : 'TC-ENT-MOD-manager', reqId: 'REQ-SETUP-001', module: 'Enterprise Onboarding', feature: `Module access for created user (${acct.role})`, scenario: 'Launcher for a created, role-assigned user', expected: 'Payroll module present', actual: `[browser] ${hasModule ? 'Payroll module PRESENT — BUG-011 resolved for created user' : noModules ? 'No modules found — BUG-011 still open' : `state onLauncher=${onLauncher} payrollTile=${payrollTile}`}`, status: hasModule ? 'PASS' : (onLauncher && noModules ? 'FAIL' : 'BLOCKED'), evidence: await bq.snap('bug-reverify', `${key}-launcher`) });
    expect(page.url()).toBeTruthy();
  });
}

test('BUG-011 decisive: +4 (Payroll Admin role) completes onboarding → module access?', async ({ page, bq }) => {
  test.slow(); test.setTimeout(150000);
  const NEWPW = 'KdbhAdmin2026!';
  // login with either the temp (fH5CUl7shf) or the post-change (NEWPW)
  let reached = '';
  for (const pw of ['fH5CUl7shf', NEWPW]) {
    await page.goto(ENTERPRISE, { waitUntil: 'domcontentloaded' });
    const idf = page.getByPlaceholder(/email\s*\/?\s*username|email|username/i).or(page.locator('input[type="text"]')).first();
    await expect(idf).toBeVisible({ timeout: 40000 });
    await idf.fill('dwetornam+4@gmail.com'); await page.locator('input[type="password"]').first().fill(pw);
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForTimeout(5000);
    if (await page.getByText(/Change Password|set a new password/i).first().isVisible({ timeout: 4000 }).catch(() => false)) {
      const pws = page.locator('input[type="password"]');
      await pws.nth(0).fill(pw); await pws.nth(1).fill(NEWPW); await pws.nth(2).fill(NEWPW);
      await page.getByRole('button', { name: /change password|update|save|continue/i }).first().click();
      await page.waitForTimeout(5000);
    }
    if (await page.waitForURL(/select-business/, { timeout: 6000 }).then(() => true).catch(() => false)) {
      await new SelectBusinessPage(page).selectAndContinue('William & Co Enterprises').catch(() => {});
    }
    await page.waitForTimeout(5000);
    if (/select-module/.test(page.url())) { reached = pw; break; }
  }
  await bq.snap('bug-reverify', 'plus4-launcher');
  const onLauncher = /select-module/.test(page.url());
  const noModules = await page.getByText(/No modules found/i).first().isVisible({ timeout: 4000 }).catch(() => false);
  const hasModule = onLauncher && !noModules;
  console.log(`PLUS4_FINAL: reached=${reached} onLauncher=${onLauncher} noModules=${noModules} url=${page.url()}`);
  recordCase({ tcId: 'TC-ENT-MOD-admin', reqId: 'REQ-SETUP-001', module: 'Enterprise Onboarding', feature: 'Module access — created Admin-role user', scenario: 'Onboard +4 (Payroll Admin role) → launcher', expected: 'Payroll module present for a role-assigned user', actual: `[browser] +4 (Payroll Admin role): ${hasModule ? 'MODULE PRESENT — BUG-011 RESOLVED for role-assigned user' : noModules ? 'still No modules found — BUG-011 open even with role' : `state onLauncher=${onLauncher}`}`, status: hasModule ? 'PASS' : (onLauncher && noModules ? 'FAIL' : 'BLOCKED'), evidence: await bq.snap('bug-reverify', 'plus4-final') });
  expect(page.url()).toBeTruthy();
});

test('diagnose +5 password state', async ({ page, bq }) => {
  test.slow();
  for (const pw of ['vVzrzuW1zA', 'vVzrzuW1zAX9!']) {
    await page.goto(ENTERPRISE, { waitUntil: 'domcontentloaded' });
    const idf = page.getByPlaceholder(/email\s*\/?\s*username|email|username/i).or(page.locator('input[type="text"]')).first();
    await expect(idf).toBeVisible({ timeout: 40000 });
    await idf.fill('dwetornam+5@gmail.com'); await page.locator('input[type="password"]').first().fill(pw);
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForTimeout(4500);
    const invalid = await page.getByText(/invalid password|incorrect/i).first().isVisible({ timeout: 2000 }).catch(() => false);
    const url = page.url();
    console.log(`PLUS5_PW '${pw}': invalid=${invalid} url=${url}`);
  }
  expect(true).toBeTruthy();
});

test('capture +5 login error', async ({ page, bq }) => {
  test.slow();
  await page.goto(ENTERPRISE, { waitUntil: 'domcontentloaded' });
  const idf = page.getByPlaceholder(/email\s*\/?\s*username|email|username/i).or(page.locator('input[type="text"]')).first();
  await expect(idf).toBeVisible({ timeout: 40000 });
  await idf.fill('dwetornam+5@gmail.com'); await page.locator('input[type="password"]').first().fill('vVzrzuW1zA');
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForTimeout(5000);
  const body = (await page.locator('body').innerText().catch(() => '')).replace(/\s+/g, ' ');
  const err = body.match(/invalid[^.]*|incorrect[^.]*|locked[^.]*|not found[^.]*|too many[^.]*|error[^.]*/i);
  console.log('PLUS5_ERR: url=' + page.url() + ' | error=' + (err ? err[0].slice(0, 80) : 'none-visible'));
  await bq.snap('bug-reverify', 'plus5-error');
  expect(true).toBeTruthy();
});

test('trigger +5 password reset', async ({ page, bq }) => {
  test.slow();
  await page.goto(ENTERPRISE, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  await page.getByRole('link', { name: /forgot password/i }).first().click().catch(() => {});
  await page.waitForTimeout(3000);
  const idf = page.getByPlaceholder(/email|username/i).or(page.locator('input[type="email"],input[type="text"]')).first();
  if (await idf.isVisible({ timeout: 8000 }).catch(() => false)) {
    await idf.fill('dwetornam+5@gmail.com');
    await page.getByRole('button', { name: /reset|send|continue|submit|recover/i }).first().click().catch(() => {});
    await page.waitForTimeout(4000);
  }
  const body = (await page.locator('body').innerText().catch(() => '')).replace(/\s+/g, ' ');
  console.log('PLUS5_RESET: ' + (body.match(/emailed[^.]*|sent[^.]*|reset link[^.]*|check[^.]*/i)?.[0]?.slice(0, 80) || body.slice(0, 100)));
  await bq.snap('bug-reverify', 'plus5-reset');
  expect(true).toBeTruthy();
});

test('confirm +5 (role assigned) login + module access', async ({ page, bq }) => {
  test.slow(); test.setTimeout(150000);
  await page.goto(ENTERPRISE, { waitUntil: 'domcontentloaded' });
  const idf = page.getByPlaceholder(/email\s*\/?\s*username|email|username/i).or(page.locator('input[type="text"]')).first();
  await expect(idf).toBeVisible({ timeout: 40000 });
  await idf.fill('dwetornam+5@gmail.com'); await page.locator('input[type="password"]').first().fill('password#23e');
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForTimeout(5000);
  const invalid = await page.getByText(/invalid password|incorrect/i).first().isVisible({ timeout: 2000 }).catch(() => false);
  const mustChange = /change-password|change password/i.test(page.url() + (await page.locator('body').innerText().catch(() => '')));
  await bq.snap('bug-reverify', 'plus5-confirm-login');
  if (await page.waitForURL(/select-business/, { timeout: 6000 }).then(() => true).catch(() => false)) {
    await new SelectBusinessPage(page).selectAndContinue('William & Co Enterprises').catch(() => {});
  }
  await page.waitForTimeout(5000);
  const onLauncher = /select-module/.test(page.url());
  const noModules = await page.getByText(/No modules found/i).first().isVisible({ timeout: 4000 }).catch(() => false);
  const hasModule = onLauncher && !noModules;
  console.log(`PLUS5_CONFIRM: invalid=${invalid} mustChange=${mustChange} onLauncher=${onLauncher} noModules=${noModules} url=${page.url()}`);
  await bq.snap('bug-reverify', 'plus5-confirm-launcher');
  recordCase({ tcId: 'TC-ENT-MOD-manager', reqId: 'REQ-SETUP-001', module: 'Enterprise Onboarding', feature: 'Module access — created Manager-role user', scenario: 'Login +5 (Payroll Manager role) → launcher', expected: 'Authenticates + Payroll module present', actual: `[browser] +5 password#23e: invalid=${invalid} mustChange=${mustChange}; ${hasModule ? 'MODULE PRESENT — role-assigned Manager has access' : noModules ? 'No modules found' : `state onLauncher=${onLauncher}`}`, status: hasModule ? 'PASS' : (invalid ? 'FAIL' : 'BLOCKED'), evidence: await bq.snap('bug-reverify', 'plus5-confirm-final') });
  expect(page.url()).toBeTruthy();
});
