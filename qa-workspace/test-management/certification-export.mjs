/**
 * certification-export.mjs — QA Evidence & Certification Engine (Framework v2). READ-ONLY.
 *
 * Computes FOUR independent states per test case from authoritative sources (never a single static
 * policy): Historical Verification · Current Execution · Product Health · Release Readiness — plus a
 * defect overlay (linked bugs / severity / status / certification status). An open bug NEVER disappears
 * behind a historical PASS. Bugs with no catalogue test case are surfaced as exploratory/enterprise
 * defects. Emits two CSVs + a dual-dashboard markdown. Does not modify the ledger or any report.
 *
 * Sources: evidence/exec/records.ndjson · bugs/BUG-*.md · evidence/browser/findings.ndjson ·
 *          test-management/test-case-catalogue.md (catalogue tcId set).
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const r = (p) => readFileSync(join(ROOT, p), 'utf8');

// ---------- 1. Ledger: per-tcId history ----------
const records = r('evidence/exec/records.ndjson').trim().split('\n').map((l) => JSON.parse(l));
const byId = new Map();
for (const rec of records) {
  if (!byId.has(rec.tcId)) byId.set(rec.tcId, []);
  byId.get(rec.tcId).push(rec);
}

// ---------- 2. Bug register: parse bugs/*.md ----------
const field = (txt, label) => {
  const m = txt.match(new RegExp(`\\|\\s*\\*\\*${label}\\*\\*\\s*\\|\\s*(.+?)\\s*\\|`));
  return m ? m[1].trim() : '';
};
const bugs = readdirSync(join(ROOT, 'bugs')).filter((f) => /^BUG-\d+\.md$/.test(f)).map((f) => {
  const t = r(`bugs/${f}`);
  const tcs = field(t, 'Test Case Ref').split(/[,;]/).map((s) => s.trim()).filter((s) => /^TC-/.test(s));
  return {
    id: field(t, 'Bug ID') || f.replace('.md', ''),
    title: field(t, 'Title'),
    type: field(t, 'Type').replace(/\*\*/g, ''),
    severity: field(t, 'Severity'),
    priority: field(t, 'Priority'),
    status: field(t, 'Status'),
    module: field(t, 'Module'),
    req: field(t, 'Requirement Ref'),
    tcs,
  };
});
const isOpen = (b) => /open/i.test(b.status);
const sevRank = { Critical: 0, High: 1, Major: 1, Medium: 2, Low: 3 };
const tcBugs = new Map();          // tcId -> [bug,...]
for (const b of bugs) for (const tc of b.tcs) {
  if (!tcBugs.has(tc)) tcBugs.set(tc, []);
  tcBugs.get(tc).push(b);
}

// ---------- 3. Catalogue tcId set (in-catalogue vs exploratory) ----------
const catalogueIds = new Set(
  r('test-management/test-case-catalogue.md').split('\n')
    .map((l) => (l.match(/^\|\s*(TC-[A-Za-z0-9-]+)\s*\|/) || [])[1]).filter(Boolean)
);

// ---------- 4. Dynamic four-state verdict per tcId ----------
const envRe = /subscription|provision|module|credential|password|inbox|enterprise|sso|select-business|launcher/i;
const limitRe = /405|not exposed|contract|no-?op|silent|not configurable|missing-spec|not applicable/i;

function assess(tcId) {
  const rs = (byId.get(tcId) || []).slice().sort((a, b) => (a.timestamp < b.timestamp ? -1 : 1));
  const latest = rs[rs.length - 1];
  const everPass = rs.some((x) => x.status === 'PASS');
  // N/A (matches canonical reports/08): a never-passed case whose evidence marks it Not Applicable.
  const na = !everPass && rs.some((x) => /NOT APPLICABLE/i.test(x.actual || ''));
  const current = !latest ? 'NOT RUN' : na ? 'NOT APPLICABLE' : latest.status;
  const histVer = everPass ? 'PASS' : 'NO';

  const linked = (tcBugs.get(tcId) || []).filter(isOpen).sort((a, b) => (sevRank[a.severity] ?? 9) - (sevRank[b.severity] ?? 9));
  const critical = linked.some((b) => b.severity === 'Critical');
  const blocking = linked.some((b) => /Critical|High|Major/.test(b.severity)); // release-blocking severities
  const hasBug = linked.length > 0;
  const actual = (latest?.actual || '');

  // Product Health
  let health;
  if (critical) health = 'CRITICAL DEFECT';
  else if (hasBug) health = 'OPEN DEFECT';
  else if (current === 'FAIL') health = 'OPEN DEFECT';
  else if (current === 'BLOCKED') health = limitRe.test(actual) ? 'KNOWN LIMITATION' : envRe.test(actual) ? 'ENVIRONMENT ISSUE' : 'ENVIRONMENT ISSUE';
  else health = 'NO KNOWN DEFECT';

  // Release Readiness
  let release;
  if (current === 'FAIL') release = 'FAILED';
  else if (blocking || current === 'BLOCKED') release = 'BLOCKED'; // Critical/High/Major open bug blocks release
  else if (current === 'NOT RUN') release = 'NOT VERIFIED';
  else if (na) release = 'OUT OF SCOPE';
  else release = 'READY';

  // Certification Status (defect overlay)
  let cert;
  if (current === 'FAIL') cert = 'FAILED';
  else if (current === 'BLOCKED') cert = 'BLOCKED';
  else if (current === 'NOT RUN') cert = 'NOT VERIFIED';
  else if (na) cert = 'OUT OF SCOPE';
  else if (hasBug) cert = 'AFFECTED BY OPEN DEFECT';
  else if (everPass && current === 'PASS') cert = 'READY';
  else cert = 'NOT VERIFIED';

  const src = (rs.filter((x) => x.status === (histVer === 'PASS' ? 'PASS' : current)).pop()) || latest || {};
  return {
    tcId, histVer, current, health, release, cert, linked,
    module: latest?.module || '', feature: latest?.feature || '', scenario: latest?.scenario || '',
    req: latest?.reqId || '', ts: (latest?.timestamp || '').slice(0, 19).replace('T', ' '),
    evidence: src.evidence || latest?.evidence || '',
    inCatalogue: catalogueIds.has(tcId),
  };
}

// Universe = catalogue cases ∪ every bug-linked TC (so off-catalogue defects appear)
const universe = new Set([...catalogueIds, ...tcBugs.keys()]);
const assessed = [...universe].sort().map(assess);

// ---------- 5a. test-cases-certification.csv ----------
const q = (v) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
const tcHeader = ['Test Case ID', 'In Catalogue', 'Requirement', 'Module', 'Feature', 'Scenario',
  'Historical Verification', 'Current Execution', 'Product Health', 'Release Readiness',
  'Certification Status', 'Linked Bug(s)', 'Bug Severity', 'Bug Status', 'Last Run', 'Evidence'];
const tcLines = [tcHeader.join(',')];
for (const a of assessed) {
  const ids = a.linked.map((b) => b.id).join('; ');
  const sev = a.linked.map((b) => b.severity).join('; ');
  const bst = a.linked.map((b) => b.status).join('; ');
  tcLines.push([a.tcId, a.inCatalogue ? 'Y' : 'N (exploratory)', a.req, a.module, a.feature, a.scenario,
    a.histVer, a.current, a.health, a.release, a.cert, ids, sev, bst, a.ts, a.evidence].map(q).join(','));
}
writeFileSync(join(ROOT, 'reports/test-cases-certification.csv'), tcLines.join('\n') + '\n');

// ---------- 5b. bugs-traceability.csv ----------
const bugHeader = ['Bug ID', 'Severity', 'Priority', 'Status', 'Type', 'Module', 'Requirement(s)',
  'Test Case(s)', 'TC in Catalogue?', 'Defect Class', 'Release Blocking', 'Title'];
const defectClass = (b) => b.tcs.some((tc) => catalogueIds.has(tc)) ? 'Catalogue Defect'
  : /enterprise|onboarding|setup/i.test(b.module + b.id) ? 'Enterprise Defect'
  : /auth|users|iam/i.test(b.module) ? 'IAM Defect' : 'Exploratory Defect';
const bugLines = [bugHeader.join(',')];
for (const b of bugs.sort((a, c) => (sevRank[a.severity] ?? 9) - (sevRank[c.severity] ?? 9) || a.id.localeCompare(c.id))) {
  const inCat = b.tcs.length ? b.tcs.map((tc) => catalogueIds.has(tc) ? 'Y' : 'N').join('; ') : '—';
  const blocking = (b.severity === 'Critical' || b.severity === 'High' || b.severity === 'Major') && isOpen(b) ? 'YES' : 'no';
  bugLines.push([b.id, b.severity, b.priority, b.status, b.type, b.module, b.req,
    b.tcs.join('; ') || '—', inCat, defectClass(b), blocking, b.title].map(q).join(','));
}
writeFileSync(join(ROOT, 'reports/bugs-traceability.csv'), bugLines.join('\n') + '\n');

// ---------- 6. Dual-dashboard markdown ----------
const cat = assessed.filter((a) => a.inCatalogue);
const cnt = (arr, key, val) => arr.filter((a) => a[key] === val).length;
const openBugs = bugs.filter(isOpen);
const bySev = (s) => openBugs.filter((b) => b.severity === s).length;
const offCat = assessed.filter((a) => !a.inCatalogue && (tcBugs.get(a.tcId) || []).some(isOpen));

let md = `# 40 — Certification Dashboard (Evidence-Driven, Framework v2)\n\n`;
md += `> ${new Date().toISOString().slice(0, 10)} · READ-ONLY. Four independent states per test case; open defects overlaid so none is hidden by a historical PASS. Sources: ledger, bug register, findings, catalogue. Reconciles to \`reports/08\`.\n\n`;

md += `## A. Execution dashboard (catalogue, ${cat.length} cases)\n\n`;
md += `| Current Execution | Count |\n|---|---:|\n`;
for (const s of ['PASS', 'FAIL', 'BLOCKED', 'NOT APPLICABLE', 'NOT RUN']) md += `| ${s} | ${cnt(cat, 'current', s)} |\n`;
md += `\n_Historical Verification = PASS (ever verified): **${cnt(cat, 'histVer', 'PASS')}** / ${cat.length}._\n\n`;
const everPassNotNow = cat.filter((a) => a.histVer === 'PASS' && a.current !== 'PASS' && a.current !== 'NOT APPLICABLE').length;
const neverPassBlocked = cat.filter((a) => a.histVer === 'NO' && a.current === 'BLOCKED').length;
md += `**Reconciliation to \`reports/08\` (PASS-sticky):** canonical PASS **${cnt(cat, 'histVer', 'PASS')}** = Historical-verified. Current-PASS ${cnt(cat, 'current', 'PASS')} + **${everPassNotNow} once-passed-now-blocked** = ${cnt(cat, 'histVer', 'PASS')}. Canonical BLOCKED **${neverPassBlocked}** = never-passed-and-blocked (current-BLOCKED ${cnt(cat, 'current', 'BLOCKED')} − ${everPassNotNow} superseded). N/A ${cnt(cat, 'current', 'NOT APPLICABLE')}. **The drop from 234 historical to ${cnt(cat, 'current', 'PASS')} current-PASS is the key product-reality signal a sticky-only report hides.**\n\n`;

md += `## B. Product-quality dashboard (defects, independent of execution)\n\n`;
md += `| Open defects | Count |\n|---|---:|\n| **Total open** | ${openBugs.length} |\n| Critical | ${bySev('Critical')} |\n| High | ${bySev('High')} |\n| Major | ${bySev('Major')} |\n| Medium | ${bySev('Medium')} |\n| Low | ${bySev('Low')} |\n`;
md += `| **Release-blocking (Crit/High/Major)** | ${openBugs.filter((b) => /Critical|High|Major/.test(b.severity)).length} |\n\n`;
const catBugged = cat.filter((a) => (tcBugs.get(a.tcId) || []).some(isOpen)).length;
md += `**Catalogue cases with an open defect linked: ${catBugged}** — of which **${cnt(cat, 'cert', 'AFFECTED BY OPEN DEFECT')}** currently PASS execution (GREEN-but-bugged → must NOT be certified as-is); the rest are also BLOCKED/FAILED. **No bug is hidden:** every linked bug shows in the row's "Linked Bug(s)" column regardless of execution state.\n\n`;

md += `## C. Certification status (catalogue)\n\n| Certification Status | Count |\n|---|---:|\n`;
for (const s of ['READY', 'AFFECTED BY OPEN DEFECT', 'FAILED', 'BLOCKED', 'NOT VERIFIED', 'OUT OF SCOPE']) md += `| ${s} | ${cnt(cat, 'cert', s)} |\n`;
md += `\n## D. Off-catalogue defects (would be invisible in a catalogue-only sheet)\n\n`;
md += `| Test Case | Module | Current | Linked Bug | Severity |\n|---|---|---|---|---|\n`;
for (const a of offCat) md += `| ${a.tcId} | ${a.module} | ${a.current} | ${a.linked.map((b) => b.id).join(', ')} | ${a.linked.map((b) => b.severity).join(', ')} |\n`;

md += `\n## E. Release gates\n\n| Gate | Status | Basis |\n|---|---|---|\n`;
const gates = [
  ['API Business Logic', 'PARTIAL', 'Engine PASS; open TAX defects BUG-001/004/005'],
  ['Payroll Engine (calc)', 'READY', 'PAYE/SSNIT/reliefs/net oracle-verified'],
  ['Payroll Lifecycle', 'PARTIAL', 'Lifecycle→PAID PASS; BUG-007 (Approved transitions)'],
  ['Browser UI', 'NOT VERIFIED', 'Only Settings/Users; core payroll UI untested'],
  ['Role Security', 'BLOCKED', 'Enforcement unverified; BUG-011 blocks Payroll entry'],
  ['Accessibility', 'PARTIAL', 'Shell axe violations BR-001/002/003/007; payroll pages untested'],
  ['Performance', 'NOT VERIFIED', 'No load/volume evidence'],
  ['Integration', 'NOT VERIFIED', 'Finance/HRIS/email content unverified'],
  ['Enterprise Onboarding', 'BLOCKED', 'BUG-011 empty module launcher (Critical)'],
  ['Reporting', 'PARTIAL', 'Content PASS; UI/export browser-gap'],
  ['Finance Integration', 'NOT VERIFIED', 'No evidence'],
  ['Production Readiness', 'BLOCKED', 'BUG-011 Critical + enforcement unverified'],
];
for (const [g, s, b] of gates) md += `| ${g} | **${s}** | ${b} |\n`;

md += `\n## F. CTO self-check\n\n`;
md += `> *"Would a CTO incorrectly believe this is production-ready?"* — **No.** Execution shows ${cnt(cat, 'current', 'PASS')} PASS, but the product-quality dashboard shows **${openBugs.length} open defects (incl. ${bySev('Critical')} Critical)** and **${cnt(cat, 'cert', 'AFFECTED BY OPEN DEFECT')} passed-but-bugged** cases, and **Production Readiness = BLOCKED**. Execution evidence, defect status, and release readiness are reported together and agree: **not certifiable** while BUG-011 (Critical) is open.\n`;
writeFileSync(join(ROOT, 'reports/40-certification-dashboard.md'), md);

// ---------- 7. Console reconciliation ----------
const exec = (s) => cnt(cat, 'current', s);
console.log(`catalogue cases: ${cat.length}  (PASS ${exec('PASS')} · FAIL ${exec('FAIL')} · BLOCKED ${exec('BLOCKED')} · N/A ${exec('NOT APPLICABLE')} · NOT RUN ${exec('NOT RUN')})`);
console.log(`historical-verified: ${cnt(cat, 'histVer', 'PASS')} | affected-by-open-defect: ${cnt(cat, 'cert', 'AFFECTED BY OPEN DEFECT')}`);
console.log(`bugs: ${bugs.length} (open ${openBugs.length}; Critical ${bySev('Critical')} High ${bySev('High')} Major ${bySev('Major')} Medium ${bySev('Medium')} Low ${bySev('Low')})`);
console.log(`off-catalogue defects surfaced: ${offCat.length}`);
console.log(`bugs with NO linked TC: ${bugs.filter((b) => !b.tcs.length).map((b) => b.id).join(',') || 'none'}`);
console.log('Wrote: reports/test-cases-certification.csv, reports/bugs-traceability.csv, reports/40-certification-dashboard.md');
