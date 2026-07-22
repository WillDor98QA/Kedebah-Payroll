/**
 * generate-coverage-matrix.mjs — the Automation Coverage Matrix: one row per documented TC-ID with
 * its Markdown source, its permanent Playwright spec, page objects used, latest execution status,
 * last-verified time, and notes. Enforces the 1:1 Markdown↔spec relationship (flags any case whose
 * spec file is missing). Output: reports/08-automation-coverage-matrix.md
 *   node test-management/generate-coverage-matrix.mjs
 */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const TC = /^TC-[A-Z]+-\d+[a-z]?$/i;
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// 1) catalogue: TC-ID → {mdFile, specFile, scenario}
const cases = [];
const tcDir = join(ROOT, 'test-cases');
for (const mod of readdirSync(tcDir)) {
  const dir = join(tcDir, mod);
  if (!statSync(dir).isDirectory()) continue;
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.md'))) {
    const md = `test-cases/${mod}/${file}`;
    const spec = `automation/tests/${slug(mod)}/${slug(file.replace(/\.md$/, ''))}.cases.spec.ts`;
    const specExists = existsSync(join(ROOT, spec));
    let cols = null;
    for (const ln of readFileSync(join(dir, file), 'utf8').split('\n')) {
      if (!ln.trim().startsWith('|')) { cols = null; continue; }
      const c = ln.split('|').slice(1, -1).map((x) => x.replace(/\*\*/g, '').trim());
      if (c.some((x) => /^tc id$/i.test(x))) { cols = c.map((x) => x.toLowerCase()); continue; }
      if (/^:?-{2,}/.test(c[0] ?? '')) continue;
      if (!cols) continue;
      const id = (c[0] ?? '').trim();
      if (!TC.test(id)) continue;
      const at = (f) => { const i = cols.findIndex((x) => x.includes(f)); return i >= 0 ? (c[i] ?? '').trim() : ''; };
      cases.push({ tcId: id, md, spec, specExists, scenario: at('scenario'), auto: at('auto') });
    }
  }
}

// 2) per-TC verdict from records.ndjson — same PASS-sticky logic as the dashboard:
//    historical PASS is never overwritten by a later BLOCKED, but a current FAIL surfaces.
//    NOT APPLICABLE (§25) is its own bucket so every total reconciles 1:1 with coverage-dashboard.md.
const recs = readFileSync(join(ROOT, 'evidence/exec/records.ndjson'), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
const byTc = new Map();
for (const r of recs) { if (!byTc.has(r.tcId)) byTc.set(r.tcId, []); byTc.get(r.tcId).push(r); }
const best = new Map();
for (const [tc, rs] of byTc) {
  const everPass = rs.some((r) => r.status === 'PASS');
  const everFail = rs.some((r) => r.status === 'FAIL');
  const na = rs.some((r) => /NOT APPLICABLE/i.test(r.actual || ''));
  const latestRec = rs.reduce((a, b) => (b.timestamp > a.timestamp ? b : a));
  const latestStatus = na && latestRec.status === 'BLOCKED' ? 'NOT APPLICABLE' : latestRec.status;
  const verified = latestStatus === 'FAIL' ? 'FAIL' : everPass ? 'PASS' : na ? 'NOT APPLICABLE' : 'BLOCKED';
  best.set(tc, { ...latestRec, status: verified, latestStatus });
}

// 3) page-objects heuristic
const pageObjects = (rec) => {
  if (!rec) return '—';
  if (rec.status === 'BLOCKED') return /UI-only/.test(rec.actual || '') ? '(UI — pending)' : '—';
  return 'ApiClient + qa-factory'; // API-driven implementations
};
const clean = (s) => (s || '').replace(/[|\r\n]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 90);

// 4) emit matrix
const date = new Date().toISOString().slice(0, 10);
const counts = { PASS: 0, FAIL: 0, BLOCKED: 0, 'NOT APPLICABLE': 0, NONE: 0 };
let missingSpec = 0;
let body = '';
for (const c of cases.sort((a, b) => a.tcId.localeCompare(b.tcId, undefined, { numeric: true }))) {
  const rec = best.get(c.tcId);
  const status = rec?.status ?? 'NOT RUN';
  counts[rec?.status ?? 'NONE']++;
  if (!c.specExists) missingSpec++;
  const last = rec?.timestamp ? rec.timestamp.slice(0, 16).replace('T', ' ') : '—';
  const note = rec?.bug ? `${rec.bug}: ${clean(rec.actual)}` : clean(rec?.actual);
  body += `| ${c.tcId} | ${c.md} | ${c.spec}${c.specExists ? '' : ' ⚠️MISSING'} | ${pageObjects(rec)} | ${status} | ${last} | ${note} |\n`;
}

let m = `# Automation Coverage Matrix — Kedebah Payroll\n\n`;
m += `> Generated ${date}. One row per documented test case, with its permanent Playwright spec and latest\n`;
m += `> execution result. Strict 1:1 Markdown↔spec: a case may only execute if its \`.cases.spec.ts\` exists.\n\n`;
m += `**Totals (verified, PASS-sticky):** ${cases.length} cases · ${counts.PASS} PASS · ${counts.FAIL} FAIL · ${counts.BLOCKED} BLOCKED · ${counts['NOT APPLICABLE']} N/A · ${counts.NONE} not-run · `;
m += `**${missingSpec} missing spec files** (must be 0).\n\n`;
m += `| Test Case ID | Markdown File | Playwright Spec | Page Objects Used | Execution Status | Last Verified | Notes |\n`;
m += `|---|---|---|---|---|---|---|\n${body}`;
writeFileSync(join(ROOT, 'reports/08-automation-coverage-matrix.md'), m);
console.log(`matrix: ${cases.length} cases → reports/08-automation-coverage-matrix.md`);
console.log(`PASS ${counts.PASS} · FAIL ${counts.FAIL} · BLOCKED ${counts.BLOCKED} · not-run ${counts.NONE} · missing-spec ${missingSpec}`);
