/**
 * beta-nonfunctional.browser.spec.ts — PERMANENT regression asset.
 *
 * Non-functional sweep, reverse-engineered live on BETA 2026-09-10 (ledger TC-BETA-PERF-*, -RESPONSIVE-*,
 * -A11Y-*, -CONCURRENCY-*, -SEC-001-*). Findings BETA-F-037 (perf), F-038 (responsive), F-039 (a11y),
 * F-040 (payment-doc download), plus PASS: unauthenticated API → 401.
 *
 * axe-core is injected from cdnjs (the app's CSP allows scripts from cdnjs.cloudflare.com).
 */
import { test, expect } from '../../../fixtures/browser.fixture.js';
import { betaReady, betaGoUrl } from './_beta-shell.js';
import { env, isBetaConfigured } from '../../../config/env.js';

const AXE = 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js';

async function runAxe(page: import('@playwright/test').Page) {
  await page.addScriptTag({ url: AXE });
  return page.evaluate(async () => {
    // @ts-expect-error injected global
    const r = await window.axe.run(document, { resultTypes: ['violations'], runOnly: ['wcag2a', 'wcag2aa'] });
    return r.violations.map((v: any) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length }));
  });
}

test.describe('BETA · Non-functional', () => {
  test.skip(!isBetaConfigured, 'BETA_* not configured.');
  test.slow();

  test('TC-BETA-A11Y-001 — the dashboard has critical/serious axe violations [FAILS today: BETA-F-039]', async ({ page }) => {
    await betaReady(page);
    const violations: Array<{ id: string; impact: string; nodes: number }> = await runAxe(page);
    const bad = violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
    // Expectation once fixed: no critical/serious violations. Today: button-name, link-name, label, color-contrast.
    expect(bad, `axe critical/serious: ${JSON.stringify(bad)}`).toEqual([]);
  });

  test('TC-BETA-PERF-001 — the dashboard reaches real content within 3 s [FAILS today: BETA-F-037]', async ({ page }) => {
    await betaReady(page); // lands on /dashboard
    const t0 = Date.now();
    await page.getByText(/Total Gross Pay/i).waitFor({ state: 'visible', timeout: 60_000 }).catch(() => {});
    const elapsed = Date.now() - t0;
    // Measured ~14 s on 2026-09-10. Expectation once BETA-F-037 is fixed: < 3000.
    expect(elapsed, `time-to-content ${elapsed} ms`).toBeLessThan(3000);
  });

  test('TC-BETA-RESPONSIVE-001 — no horizontal scroll / content clipping at 390 px [FAILS today: BETA-F-038]', async ({ page }) => {
    await betaReady(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await betaGoUrl(page, '/payroll');
    await page.waitForTimeout(3000);
    const m = await page.evaluate(() => {
      const de = document.documentElement;
      const h1 = document.querySelector('h1');
      return { hScroll: de.scrollWidth > de.clientWidth + 1, h1Left: h1 ? Math.round(h1.getBoundingClientRect().left) : null };
    });
    expect(m.hScroll, 'body scrolls horizontally at 390px').toBe(false);
    expect(m.h1Left ?? 0, 'page heading pushed off-screen by the phantom sidebar').toBeLessThan(24);
  });

  test('TC-BETA-SEC-001-API-AUTH — payrollApi rejects unauthenticated requests', async ({ page }) => {
    await betaReady(page);
    const statuses = await page.evaluate(async (base) => {
      const hit = (p: string) => fetch(`${base}${p}`, { credentials: 'omit', headers: { accept: 'application/json' } }).then((r) => r.status).catch(() => -1);
      return { payRun1: await hit('/pay-runs/1'), employees: await hit('/employees'), user: await hit('/user') };
    }, env.beta.apiBaseURL);
    expect(statuses.payRun1).toBe(401);
    expect(statuses.employees).toBe(401);
    expect(statuses.user).toBe(401);
  });

  // TC-BETA-CONCURRENCY-001 (stale-tab double-submit → server 422, silent client) and
  // TC-BETA-DOC-DOWNLOAD-001 / SEC-001-DOC (payment_documents[].url returns the SPA shell — BETA-F-040)
  // are verified manually (ledger 2026-09-10) — they need a second browser context / an uploaded file fixture.
  test.fixme('TC-BETA-DOC-DOWNLOAD-001 — payment document downloads as a real file [BETA-F-040]', async () => {});
});
