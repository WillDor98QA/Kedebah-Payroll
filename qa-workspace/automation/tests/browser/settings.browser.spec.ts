/**
 * settings.browser.spec.ts — Browser exploration of the Settings hub + Organization Setup (priority 1).
 * Reuses the permanent harness: app-shell nav, BQ evidence/axe/snap, browser-recorder (findings + ledger).
 */
import { test, expect } from '../../fixtures/browser.fixture.js';
import { AppShell } from '../../pages/app-shell.page.js';
import { SettingsPage, SETUP_CARDS } from '../../pages/settings.page.js';
import { recordFinding, recordCase } from '../../helpers/browser-recorder.js';
import { isAppConfigured } from '../../config/env.js';

test.describe('Settings hub + Organization Setup (browser exploration)', () => {
  test.skip(!isAppConfigured, 'App not configured.');
  test.slow();

  test('Settings hub renders, cards/statuses, health, a11y', async ({ page, bq }) => {
    const shell = new AppShell(page);
    await shell.ensureReady();
    await shell.go('Settings');
    const settings = new SettingsPage(page);
    await settings.expectLoaded();
    await page.waitForTimeout(4000); // let lazy setup-card statuses populate
    const shot = await bq.snap('settings', 'hub-desktop');

    // Capture each card's status badge (real data) — reverse-engineering the setup model.
    const statuses: Record<string, string> = {};
    for (const c of SETUP_CARDS) {
      const txt = await settings.card(c).getByText(/Completed|Optional/i).first().innerText().catch(() => 'NOT FOUND');
      statuses[c] = txt.trim();
    }
    const ax = await bq.axe();
    const health = bq.health();
    console.log('SETTINGS_HUB:', JSON.stringify({ statuses, health: health.summary, axe: ax.total, axeTop: ax.violations.slice(0, 6) }));

    // Record the Settings-hub render as a browser case (Dashboard-class no-console-errors check).
    recordCase({ tcId: 'TC-DASH-002', reqId: 'REQ-DASH-001', module: 'Dashboard', feature: 'No console/network errors (browser)', scenario: 'Load Settings hub; capture console+network', expected: 'No JS errors, no failed requests', actual: health.ok ? `clean (${health.summary})` : health.summary, status: health.ok ? 'PASS' : 'FAIL', evidence: shot, ...(health.ok ? {} : { bug: 'BR-004' }) });

    if (!health.ok) recordFinding({ category: 'Bug', severity: 'Major', priority: 'P2', module: 'Settings', page: '/settings', viewport: '1280x720', userImpact: 'Failed network request / console error on the Settings hub.', businessImpact: 'Broken asset/endpoint on the primary setup hub.', steps: ['Log in', 'Open Settings'], expected: 'No failed requests/console errors.', actual: health.summary, evidence: [shot], suggestedFix: 'Capture HAR; fix the failing request.', status: 'FAIL' });
    if (ax.violations.some((v) => v.impact === 'critical' || v.impact === 'serious')) recordFinding({ category: 'Accessibility', severity: 'Major', priority: 'P2', module: 'Settings', page: '/settings', userImpact: 'Settings hub has serious/critical a11y violations.', steps: ['axe scan /settings'], expected: 'No serious/critical axe violations.', actual: `axe: ${ax.violations.map((v) => `${v.id}(${v.impact}):${v.nodes}`).join(', ')}`, evidence: [shot], status: 'FAIL' });

    // All 10 cards must be present & each must carry a status badge (UX completeness).
    const missing = Object.entries(statuses).filter(([, v]) => v === 'NOT FOUND').map(([k]) => k);
    expect(page.url()).toContain('settings');
    if (missing.length) recordFinding({ category: 'UX', severity: 'Minor', priority: 'P3', module: 'Settings', page: '/settings', userImpact: `Setup card(s) without a visible status badge: ${missing.join(', ')}`, steps: ['Open Settings', 'Inspect each card'], expected: 'Every card shows Completed/Optional.', actual: `missing: ${missing.join(', ')}`, evidence: [shot], status: 'OBSERVATION' });
  });

  test('Organization Setup — open card, inspect page (no API module)', async ({ page, bq }) => {
    const shell = new AppShell(page);
    await shell.ensureReady();
    await shell.go('Settings');
    const settings = new SettingsPage(page);
    await settings.expectLoaded();
    await page.waitForTimeout(3000);
    await settings.openCard('Organization Setup');
    await page.waitForTimeout(3000);
    const url = page.url();
    const shot = await bq.snap('organization-setup', 'page-desktop');
    const ax = await bq.axe();
    const health = bq.health();
    // Reverse-engineer what genuinely exists: form fields / headings on the org page.
    const fieldCount = await page.locator('input, select, textarea').count();
    const headings = await page.getByRole('heading').allInnerTexts().catch(() => []);
    console.log('ORG_SETUP:', JSON.stringify({ url, fieldCount, headings: headings.slice(0, 8), health: health.summary, axe: ax.total }));

    const rendered = fieldCount > 0 || /organization/i.test(headings.join(' '));
    recordCase({ tcId: 'TC-ORGB-001', reqId: 'REQ-SETUP-001', module: 'Organization Setup', feature: 'Org Setup page renders (browser)', scenario: 'Open Organization Setup card → page renders with form', expected: 'Organization Setup form renders (company details/branding/currency/timezone)', actual: rendered ? `rendered: url=${url}, ${fieldCount} fields, headings=[${headings.slice(0, 4).join('; ')}]` : `did not render a form (url=${url})`, status: rendered ? 'PASS' : 'FAIL', evidence: shot });
    recordFinding({ category: 'Undocumented Behaviour', severity: 'Info', priority: 'P3', module: 'Organization Setup', page: url, userImpact: 'Organization Setup is a browser-only module (no API contract); documenting genuine behaviour.', businessImpact: 'Requirement gap — module not in the requirements catalogue.', steps: ['Settings → Organization Setup → View & update'], expected: '(undocumented — reverse-engineered)', actual: `Organization Setup page at ${url} with ${fieldCount} form field(s); headings: ${headings.slice(0, 6).join(' | ')}`, evidence: [shot], reqRef: 'GAP — no REQ-ORG-*', status: 'OBSERVATION' });
    if (!health.ok) recordFinding({ category: 'Bug', severity: 'Major', priority: 'P2', module: 'Organization Setup', page: url, userImpact: 'Console/network errors on Organization Setup.', steps: ['Open Organization Setup'], expected: 'No failed requests.', actual: health.summary, evidence: [shot], status: 'FAIL' });
    expect(rendered, 'Organization Setup page rendered').toBeTruthy();
  });
});
