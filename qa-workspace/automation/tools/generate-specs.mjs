/**
 * generate-specs.mjs — scaffold ONE permanent Playwright spec per test-cases/<Module>/<file>.md,
 * maintaining a strict 1:1 Markdown↔spec relationship. Each generated spec lists every documented
 * TC-ID as a named test that dispatches through helpers/case-runner.ts (real assertion via the
 * registry, or skip-with-reason). Permanent assets — committed, hand-editable.
 *
 * Idempotent by default: only creates a spec that does NOT yet exist (never clobbers edits).
 *   node tools/generate-specs.mjs          # create missing specs
 *   node tools/generate-specs.mjs --force  # rewrite all (use only to re-scaffold)
 */
import { readFileSync, writeFileSync, readdirSync, statSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const FORCE = process.argv.includes('--force');
const TC_ROOT = '../test-cases';            // relative to automation/
const OUT_ROOT = 'tests';
const TC = /^TC-[A-Z]+-\d+[a-z]?$/i;
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const esc = (s) => (s || '').replace(/[`\r\n|]/g, ' ').replace(/'/g, '’').replace(/\s+/g, ' ').trim();

function parseFile(p) {
  const rows = []; let cols = null;
  for (const ln of readFileSync(p, 'utf8').split('\n')) {
    if (!ln.trim().startsWith('|')) { cols = null; continue; }
    const c = ln.split('|').slice(1, -1).map((x) => x.replace(/\*\*/g, '').trim());
    if (c.some((x) => /^tc id$/i.test(x))) { cols = c.map((x) => x.toLowerCase()); continue; }
    if (/^:?-{2,}/.test(c[0] ?? '')) continue;
    if (!cols) continue;
    const id = (c[0] ?? '').trim();
    if (!TC.test(id)) continue;
    const at = (f) => { const i = cols.findIndex((x) => x.includes(f)); return i >= 0 ? (c[i] ?? '').trim() : ''; };
    rows.push({ tcId: id, scenario: at('scenario') });
  }
  return rows;
}

let created = 0, skipped = 0, total = 0;
for (const mod of readdirSync(TC_ROOT)) {
  const dir = join(TC_ROOT, mod);
  if (!statSync(dir).isDirectory()) continue;
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.md'))) {
    const rows = parseFile(join(dir, file));
    if (!rows.length) continue;
    const base = file.replace(/\.md$/, '');
    const outDir = join(OUT_ROOT, slug(mod));
    const outFile = join(outDir, `${slug(base)}.cases.spec.ts`);
    total++;
    if (existsSync(outFile) && !FORCE) { skipped++; continue; }
    mkdirSync(outDir, { recursive: true });
    const tests = rows.map((r) => `  test('${r.tcId} — ${esc(r.scenario) || 'case'}', async () => { await runCase(api, '${r.tcId}'); });`).join('\n');
    const src = `/**
 * ${base}.cases.spec.ts — PERMANENT automation asset (1:1 with test-cases/${mod}/${file}).
 * One named test per documented TC-ID (${rows.length} cases). Each dispatches through
 * helpers/case-runner.ts → real assertion via helpers/tc-registry.ts, or skip-with-documented-reason.
 * Do not delete. To implement a skipped case, add/extend its entry in tc-registry.ts.
 */
import { test } from '@playwright/test';
import { existsSync } from 'node:fs';
import { ApiClient } from '../../helpers/api-client.js';
import { isAppConfigured } from '../../config/env.js';
import { runCase } from '../../helpers/case-runner.js';
import * as F from '../../helpers/qa-factory.js';

const STATE = 'fixtures/.auth/admin.json';
let api: ApiClient;
test.beforeAll(async () => {
  test.skip(!isAppConfigured || !existsSync(STATE), 'Admin storage state unavailable (refresh token).');
  api = await ApiClient.fromState(STATE);
  await F.refs(api);
});
test.afterAll(async () => { if (api) { await F.deactivateAll(api); await api.dispose(); } });

test.describe('${esc(mod)} · ${esc(base)} (${rows.length} cases)', () => {
${tests}
});
`;
    writeFileSync(outFile, src);
    created++;
    console.log(`${FORCE && existsSync ? 'wrote' : 'created'} ${outFile} (${rows.length} cases)`);
  }
}
console.log(`\nspecs: ${total} md files · created ${created} · preserved ${skipped}`);
