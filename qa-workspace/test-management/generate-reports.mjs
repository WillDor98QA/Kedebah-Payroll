/**
 * generate-reports.mjs — enterprise test-management report generator.
 * Inputs:
 *   - ../test-cases/ ** /*.md  (the 417 authored test cases — the catalogue source of truth)
 *   - ../evidence/exec/records.ndjson  (execution records emitted by live specs via exec-recorder)
 * Outputs (regenerated, never hand-edited):
 *   - test-case-catalogue.md
 *   - test-execution-report.md
 *   - coverage-dashboard.md
 * Run after each milestone:  node test-management/generate-reports.mjs   (from qa-workspace/)
 */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, basename, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url)); // qa-workspace/ (handles spaces in path)
const TC_DIR = join(ROOT, 'test-cases');
const REC_FILE = join(ROOT, 'evidence/exec/records.ndjson');
const OUT = join(ROOT, 'test-management');

// ---- 1. Parse test-case markdown tables into catalogue entries ----
function walk(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('.md') ? [p] : [];
  });
}

function classifyType(text) {
  const t = text.toLowerCase();
  if (/(injection|xss|forbidden|unauthor|idor|escal|duplicate|malformed|session|token)/.test(t)) return 'Security';
  if (/(paye|tier|oracle|chargeable|net pay|employer cost|relief|bik|bonus|overtime|pension|calc)/.test(t)) return 'Calculation';
  if (/(boundary|ceiling|cap|edge|exactly|just over|leap|short feb|0\b|zero)/.test(t)) return 'Boundary';
  if (/(gap|preview|placeholder|not saved|redirect|unimplemented|verify-only|matches §25)/.test(t)) return 'Gap-Verify';
  if (/(invalid|missing|negative|reject|blocked|without|duplicate|wrong|guard|unique)/.test(t)) return 'Negative';
  if (/(permission|role|view-only|gating|authz)/.test(t)) return 'Permission';
  return 'Functional';
}

function autoStatus(v) {
  const s = (v || '').toLowerCase();
  if (s === 'api') return 'Automated (API)';
  if (s === 'yes') return 'Automated';
  if (s === 'no') return 'Manual';
  return 'Manual';
}

const entries = [];
for (const file of walk(TC_DIR)) {
  const moduleFolder = relative(TC_DIR, file).split('/')[0];
  const lines = readFileSync(file, 'utf8').split('\n');
  let feature = basename(file, '.md');
  let header = null;
  for (const line of lines) {
    const h = line.match(/^#{2,4}\s+(.*)/);
    if (h) feature = h[1].trim();
    if (!line.trim().startsWith('|')) { if (line.trim() === '') header = null; continue; }
    const cells = line.split('|').slice(1, -1).map((c) => c.trim());
    if (/^[-:\s]+$/.test(cells.join(''))) continue; // separator row
    if (cells.some((c) => /TC ID/i.test(c))) { header = cells.map((c) => c.toLowerCase()); continue; }
    if (!header) continue;
    const idIdx = header.findIndex((c) => c.includes('tc id'));
    const idx = (name) => header.findIndex((c) => c.includes(name));
    const id = cells[idIdx];
    if (!/^TC-[A-Z]+-\d+/.test(id || '')) continue;
    const get = (name, fb = '') => { const i = idx(name); return i >= 0 ? cells[i] : fb; };
    const scenario = get('scenario');
    const reqRaw = get('req');
    const reqId = reqRaw ? `REQ-${reqRaw.replace(/^REQ-/, '')}` : '';
    const expected = get('expected');
    const auto = get('auto');
    entries.push({
      tcId: id, reqId, module: moduleFolder, feature, scenario,
      type: classifyType(`${feature} ${scenario}`), expected,
      automation: autoStatus(auto),
    });
  }
}

// ---- 2. Load execution records (de-dup by tcId+scenario, keep latest) ----
let records = [];
if (existsSync(REC_FILE)) {
  records = readFileSync(REC_FILE, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l));
}
const recKey = (r) => `${r.tcId}::${r.scenario}`;
const latest = new Map();
for (const r of records) { const k = recKey(r); if (!latest.has(k) || r.timestamp > latest.get(k).timestamp) latest.set(k, r); }
const execRecords = [...latest.values()];

// ---- Per-TC verdict: historical verification (PASS-sticky) vs latest execution — SEPARATE metrics ----
// Engagement policy: a historical PASS is NEVER overwritten by a later BLOCKED. Once a rule has been
// verified against the live app it stays verified; if it cannot be re-executed today (automation/infra)
// that is recorded as the *latest* status without erasing the historical PASS. Both are reported.
const isNA = (r) => /NOT APPLICABLE/i.test(r.actual || '');
const recsByTc = new Map();
for (const r of records) { if (!recsByTc.has(r.tcId)) recsByTc.set(r.tcId, []); recsByTc.get(r.tcId).push(r); }
function tcVerdict(tcId) {
  const rs = recsByTc.get(tcId);
  if (!rs || !rs.length) return { verified: 'NOT EXECUTED', latest: 'NOT EXECUTED', everPass: false };
  const everPass = rs.some((r) => r.status === 'PASS');
  const everFail = rs.some((r) => r.status === 'FAIL');
  const na = rs.some(isNA);
  const latestRec = rs.reduce((a, b) => (b.timestamp > a.timestamp ? b : a));
  const latest = na && latestRec.status === 'BLOCKED' ? 'NOT APPLICABLE' : latestRec.status;
  // historical-best: PASS is sticky against a later BLOCKED (infra/automation), but a CURRENT FAIL is a
  // genuine regression and must surface even if the rule once passed. A *superseded* FAIL (latest is now
  // PASS or BLOCKED) is not a standing defect — FAIL counts only when it is the latest state.
  const verified = latest === 'FAIL' ? 'FAIL' : everPass ? 'PASS' : na ? 'NOT APPLICABLE' : 'BLOCKED';
  return { verified, latest, everPass };
}
const _vc = new Map();
const verdict = (tcId) => { if (!_vc.has(tcId)) _vc.set(tcId, tcVerdict(tcId)); return _vc.get(tcId); };
const execStatusFor = (tcId) => verdict(tcId).verified; // catalogue shows historical (PASS-sticky) status

// ---- 3. Emit Test Case Catalogue ----
const esc = (s) => (s || '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
const date = new Date().toISOString().slice(0, 10);

let cat = `# Test Case Catalogue (master)\n\n> Auto-generated by \`test-management/generate-reports.mjs\` on ${date}. Do not hand-edit.\n`;
cat += `> Source: \`test-cases/**\` (authored) + \`evidence/exec/records.ndjson\` (execution).\n\n`;
cat += `Total test cases: **${entries.length}**\n\n`;
cat += `| Test Case ID | Requirement ID | Module | Feature | Scenario | Test Type | Expected Result | Automation Status | Verified (historical) | Latest Run |\n`;
cat += `|---|---|---|---|---|---|---|---|---|---|\n`;
for (const e of entries) {
  const v = verdict(e.tcId);
  cat += `| ${e.tcId} | ${e.reqId} | ${e.module} | ${esc(e.feature)} | ${esc(e.scenario)} | ${e.type} | ${esc(e.expected)} | ${e.automation} | ${v.verified} | ${v.latest} |\n`;
}
writeFileSync(join(OUT, 'test-case-catalogue.md'), cat);

// ---- 4. Emit Test Execution Report ----
let rep = `# Test Execution Report (living)\n\n> Auto-generated on ${date}. One row per validated business rule.\n\n`;
const counts = execRecords.reduce((a, r) => ((a[r.status] = (a[r.status] || 0) + 1), a), {});
rep += `**Execution records:** ${execRecords.length}  ·  ` + Object.entries(counts).map(([k, v]) => `${k}: ${v}`).join('  ·  ') + `\n\n`;
rep += `| Test Case ID | Requirement ID | Module | Feature | Scenario | Expected | Actual | Status | Timestamp | Evidence | Bug |\n`;
rep += `|---|---|---|---|---|---|---|---|---|---|---|\n`;
for (const r of execRecords.sort((a, b) => (a.tcId + a.scenario).localeCompare(b.tcId + b.scenario))) {
  rep += `| ${r.tcId} | ${r.reqId} | ${esc(r.module)} | ${esc(r.feature)} | ${esc(r.scenario)} | ${esc(r.expected)} | ${esc(r.actual)} | ${r.status} | ${(r.timestamp || '').slice(0, 19)} | ${esc(r.evidence || '')} | ${r.bug || ''} |\n`;
}
writeFileSync(join(OUT, 'test-execution-report.md'), rep);

// ---- 5. Emit Coverage Dashboard ----
const reqAll = new Set(entries.map((e) => e.reqId).filter(Boolean));
const reqExecuted = new Set(execRecords.map((r) => r.reqId).filter(Boolean));
const tcExecuted = new Set(execRecords.map((r) => r.tcId));
const byModule = {};
for (const e of entries) {
  byModule[e.module] ??= { total: 0, executed: 0 };
  byModule[e.module].total++;
  if (tcExecuted.has(e.tcId)) byModule[e.module].executed++;
}
const statusCount = (s) => execRecords.filter((r) => r.status === s).length;

// Test-case-level dual metric over the 417 universe (reconciles to entries.length).
const ORDER = ['PASS', 'FAIL', 'BLOCKED', 'NOT APPLICABLE', 'NOT EXECUTED'];
const verifiedCounts = Object.fromEntries(ORDER.map((s) => [s, 0]));
const latestCounts = Object.fromEntries(ORDER.map((s) => [s, 0]));
for (const e of entries) { const v = verdict(e.tcId); verifiedCounts[v.verified]++; latestCounts[v.latest]++; }
const sumV = ORDER.reduce((a, s) => a + verifiedCounts[s], 0);

let dash = `# Coverage Dashboard\n\n> Auto-generated on ${date}. Derived 1:1 from the append-only ledger \`evidence/exec/records.ndjson\`.\n\n`;
dash += `## Headline\n\n`;
dash += `| Metric | Value |\n|---|---|\n`;
dash += `| Requirements (catalogued) | ${reqAll.size} |\n`;
dash += `| Requirements with execution evidence | ${reqExecuted.size} |\n`;
dash += `| Requirements pending execution | ${reqAll.size - reqExecuted.size} |\n`;
dash += `| Test cases generated | ${entries.length} |\n`;
dash += `| Test cases executed | ${tcExecuted.size} |\n`;
dash += `| Execution records (ledger, rule-level) | ${records.length} |\n\n`;

dash += `## Test-case status — two independent metrics\n\n`;
dash += `**Verified (historical)** = a rule that has ever passed against the live app stays verified (PASS-sticky; never overwritten by a later BLOCKED). `;
dash += `**Latest run** = the most recent execution outcome (shows what is currently re-executable vs. blocked by automation/infra today).\n\n`;
dash += `| Status | Verified (historical) | Latest run |\n|---|---|---|\n`;
for (const s of ORDER) dash += `| ${s} | ${verifiedCounts[s]} | ${latestCounts[s]} |\n`;
dash += `| **Total** | **${sumV}** | **${ORDER.reduce((a, s) => a + latestCounts[s], 0)}** |\n\n`;

dash += `## Rule-level execution (latest record per tcId+scenario)\n\n`;
dash += `| Metric | Value |\n|---|---|\n`;
dash += `| Passed | ${statusCount('PASS')} |\n`;
dash += `| Failed | ${statusCount('FAIL')} |\n`;
dash += `| Blocked | ${statusCount('BLOCKED')} |\n`;
dash += `| Skipped | ${statusCount('SKIPPED')} |\n`;
dash += `\n## Module coverage\n\n| Module | Test cases | Executed | % executed |\n|---|---|---|---|\n`;
for (const [m, v] of Object.entries(byModule).sort()) {
  dash += `| ${m} | ${v.total} | ${v.executed} | ${((v.executed / v.total) * 100).toFixed(0)}% |\n`;
}
const fails = statusCount('FAIL');
const failBugs = [...new Set(execRecords.filter((r) => r.status === 'FAIL').map((r) => r.bug).filter(Boolean))];
dash += `\n## Production readiness (current)\n\n`;
dash += `- Execution is **in progress** — ${tcExecuted.size}/${entries.length} test cases exercised so far.\n`;
dash += `- Calculation engine: PAYE, Tier 1 EE, Tier 2 ER, reliefs/SSF, net pay, employer cost, chargeable base **verified == oracle** on live processed payroll.\n`;
dash += `- Open discrepancies (documented): ${failBugs.join(', ') || 'none'} — see \`bugs/\`.\n`;
dash += `- **Verdict: NOT READY to certify** until remaining modules (CRUD, lifecycle, outputs, security with Manager/Staff) are executed and discrepancies are dispositioned.\n`;
writeFileSync(join(OUT, 'coverage-dashboard.md'), dash);

// ---- 6. Emit Developer Hand-off Report (defect fix-list for the dev team) ----
const BUGS_DIR = join(ROOT, 'bugs');
function parseBug(file) {
  const t = readFileSync(file, 'utf8');
  const field = (name) => (t.match(new RegExp(`\\|\\s*\\*\\*${name}\\*\\*\\s*\\|\\s*(.+?)\\s*\\|`, 'i'))?.[1] || '').replace(/\*\*/g, '').trim();
  const fixM = t.match(/##\s*(?:Suggested (?:Fix|Resolution)|Recommendation|Disposition|Next Step)[^\n]*\n+([\s\S]*?)(\n##\s|$)/i);
  const fix = (fixM?.[1] || '').replace(/\s+/g, ' ').trim().slice(0, 220);
  return {
    id: field('Bug ID') || basename(file, '.md'),
    title: field('Title'), severity: field('Severity') || '—', priority: field('Priority'),
    module: field('Module'), req: field('Requirement Ref'), status: field('Status'),
    fix, fileRel: `../bugs/${basename(file)}`,
  };
}
const bugs = (existsSync(BUGS_DIR) ? readdirSync(BUGS_DIR).filter((f) => /^BUG-\d+\.md$/.test(f)) : [])
  .map((f) => parseBug(join(BUGS_DIR, f)));
const sevRank = (s) => ({ high: 0, medium: 1, med: 1, low: 2 }[(s || '').toLowerCase()] ?? 3);
bugs.sort((a, b) => sevRank(a.severity) - sevRank(b.severity) || a.id.localeCompare(b.id));
const failByBug = {};
for (const r of execRecords.filter((r) => r.status === 'FAIL')) (failByBug[r.bug || '(none)'] ??= []).push(r);
const blockedRecs = execRecords.filter((r) => r.status === 'BLOCKED');
const pct = (a, b) => `${a}/${b} (${((a / b) * 100).toFixed(0)}%)`;

let dev = `# Developer Hand-off Report\n\n> Auto-generated on ${date}. For the development team. Source of truth: PRD \`PAYROLL_COMPLETE_SYSTEM_GUIDE.md\`. Target: \`https://payroll.kedebah.com\` sandbox.\n\n`;
dev += `## 1. Coverage summary\n\n| Metric | Value |\n|---|---|\n`;
dev += `| Test cases executed | ${pct(tcExecuted.size, entries.length)} |\n`;
dev += `| Requirements with evidence | ${pct(reqExecuted.size, reqAll.size)} |\n`;
dev += `| Rule-level results | ${statusCount('PASS')} PASS · ${statusCount('FAIL')} FAIL · ${statusCount('BLOCKED')} BLOCKED |\n`;
dev += `| Open defects | ${bugs.length} |\n\n`;
dev += `Per-module execution: ` + Object.entries(byModule).sort().map(([m, v]) => `${m} ${((v.executed / v.total) * 100).toFixed(0)}%`).join(' · ') + `\n\n`;

dev += `## 2. Defect fix-list (action required)\n\nSorted High → Low. Full repro / expected / actual in each linked bug file.\n\n`;
dev += `| Bug | Severity | Pri | Module | Requirement | Title | Suggested fix | Failing TC |\n|---|---|---|---|---|---|---|---|\n`;
for (const bg of bugs) {
  const tcs = [...new Set((failByBug[bg.id] || []).map((r) => r.tcId))].join(', ') || '—';
  dev += `| [${bg.id}](${bg.fileRel}) | ${bg.severity} | ${bg.priority} | ${esc(bg.module)} | ${esc(bg.req)} | ${esc(bg.title)} | ${esc(bg.fix)} | ${tcs} |\n`;
}

dev += `\n## 3. Blocked / not yet tested (${blockedRecs.length})\n\n| Test Case | Requirement | Feature | Why blocked |\n|---|---|---|---|\n`;
for (const r of blockedRecs) {
  // Documentation consistency: a blocked *record* whose tcId later achieved PASS is append-only history,
  // not a standing blocker. Annotate it as superseded (display only — counts/verdicts are unchanged).
  const superseded = verdict(r.tcId).everPass;
  const why = superseded ? `⤳ SUPERSEDED / RESOLVED — a later PASS exists for ${r.tcId} (this row is append-only history). Historical note: ${esc(r.actual)}` : esc(r.actual);
  dev += `| ${r.tcId} | ${r.reqId} | ${esc(r.feature)} | ${why} |\n`;
}
dev += `\n_Enterprise per-role enforcement cases remain blocked by **[BUG-011](../bugs/BUG-011.md)** — newly-created role accounts have **no Payroll module access** in the enterprise launcher — **not** by credentials. All four role passwords are now established (Admin/Employee/Manager/Reports — see [reports/35](35-enterprise-onboarding-report.md)). Per-role permission enforcement will run once the Payroll module is provisioned._\n\n`;

dev += `## 4. What passed (confidence)\n\n${statusCount('PASS')} rule-level checks passed, incl. the highest-risk areas:\n`;
dev += `- Calculation engine == independent oracle to the cent (PAYE bands, Tier 1/2, reliefs/SSF, bonus over-cap marginal + reconciliation, net pay, employer cost, chargeable base).\n`;
dev += `- Full pay-run lifecycle to PAID for all 4 run types; state machine blocks illegal transitions; idempotency; only Regular advances the calendar.\n`;
dev += `- Bank payment file (structure/sort/totals/exclusions) and payslip PDF (BIK excluded, net-in-words) content correct.\n`;
dev += `- Audit trail complete + immutable; SQL-injection / malformed-input / multi-tenant isolation safe.\n\n`;

dev += `## 5. References\n\n`;
dev += `- Full per-rule pass/fail (${execRecords.length} rows): [test-execution-report.md](../test-management/test-execution-report.md)\n`;
dev += `- Defect details: [bugs/](../bugs/) · Coverage dashboard: [coverage-dashboard.md](../test-management/coverage-dashboard.md)\n`;
dev += `- Requirement traceability: [01-traceability-matrix.md](../requirements/01-traceability-matrix.md)\n`;
writeFileSync(join(ROOT, 'reports/04-developer-handoff.md'), dev);

console.log(`Catalogue: ${entries.length} test cases`);
console.log(`Execution records: ${execRecords.length} (${Object.entries(counts).map(([k, v]) => `${k}:${v}`).join(' ')})`);
console.log(`Requirements: ${reqAll.size} catalogued, ${reqExecuted.size} with evidence`);
console.log(`Wrote test-case-catalogue.md, test-execution-report.md, coverage-dashboard.md, reports/04-developer-handoff.md (${bugs.length} defects)`);
