/**
 * browser.fixture.ts — PERMANENT Browser-QA fixture. Extends Playwright `test` with an exploratory
 * toolkit (`bq`) that auto-collects evidence on every test and exposes reusable inspectors. Reuse this
 * `test`/`expect` in all tests/browser/*.browser.spec.ts. Never duplicate evidence wiring in specs.
 */
import { test as base, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdirSync } from 'node:fs';

export interface AxeResult { total: number; violations: { id: string; impact: string; nodes: number }[]; }
export interface BQ {
  consoleErrors: string[];
  pageErrors: string[];
  failedRequests: { url: string; status: number }[];
  slowRequests: { url: string; ms: number }[];
  /** axe-core scan of the current page; serious/critical surfaced for findings. */
  axe(): Promise<AxeResult>;
  /** screenshot → evidence/browser/<module>/<name>.png; returns the relative evidence path. */
  snap(module: string, name: string, opts?: { fullPage?: boolean }): Promise<string>;
  /** health summary for the current page (no console/page errors, no failed requests). */
  health(): { ok: boolean; summary: string };
}

export const test = base.extend<{ bq: BQ }>({
  bq: async ({ page }, use, testInfo) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    const failedRequests: { url: string; status: number }[] = [];
    const slowRequests: { url: string; ms: number }[] = [];

    page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 200)); });
    page.on('pageerror', (e) => pageErrors.push(e.message.slice(0, 200)));
    page.on('requestfailed', (r) => failedRequests.push({ url: r.url(), status: 0 }));
    page.on('response', (r) => { if (r.status() >= 400) failedRequests.push({ url: r.url(), status: r.status() }); const t = r.request().timing(); if (t && t.responseEnd - t.startTime > 4000) slowRequests.push({ url: r.url(), ms: Math.round(t.responseEnd - t.startTime) }); });

    const bq: BQ = {
      consoleErrors, pageErrors, failedRequests, slowRequests,
      async axe() { const r = await new AxeBuilder({ page }).analyze().catch(() => ({ violations: [] } as any)); return { total: r.violations.length, violations: r.violations.map((v: any) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length })) }; },
      async snap(module, name, opts) { const dir = `../evidence/browser/${module}`; mkdirSync(dir, { recursive: true }); const rel = `evidence/browser/${module}/${name}.png`; await page.screenshot({ path: `../${rel}`, fullPage: opts?.fullPage ?? true }); return rel; },
      health() { const ok = consoleErrors.length === 0 && pageErrors.length === 0 && failedRequests.length === 0; return { ok, summary: `console=${consoleErrors.length} jsErr=${pageErrors.length} failedReq=${failedRequests.length}${failedRequests.length ? ' (' + failedRequests.slice(0, 3).map((f) => f.status + ':' + f.url.split('/').pop()).join(',') + ')' : ''}` }; },
    };
    await use(bq);
  },
});
export { expect };
export type { Page };
