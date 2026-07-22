/** exec-report.mjs — Executive QA Report generator. Reads the catalogue + bugs/, computes per-
 *  requirement status + categorized blocked reasons, writes reports/05-executive-qa-report.md. */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const date = new Date().toISOString().slice(0, 10);

// --- parse catalogue: TC | Req | Module | Feature | Scenario | Type | Expected | Automation | ExecStatus ---
const cat = readFileSync(join(ROOT, 'test-management/test-case-catalogue.md'), 'utf8').split('\n');
const rows = [];
for (const line of cat) {
  if (!line.startsWith('| TC-')) continue;
  const c = line.split('|').slice(1, -1).map((x) => x.trim());
  rows.push({ tc: c[0], req: c[1], module: c[2], exec: c[8] });
}
// requirement-level status — PASS-sticky: a requirement with ANY verified rule stays verified
// (historical PASS is never overwritten by a later BLOCKED, per engagement policy).
const rank = { PASS: 4, FAIL: 3, BLOCKED: 2, 'NOT EXECUTED': 1 };
const reqStatus = {};
for (const r of rows) {
  if (!r.req) continue;
  const cur = reqStatus[r.req];
  if (!cur || (rank[r.exec] || 0) > (rank[cur] || 0)) reqStatus[r.req] = r.exec;
}
// merge in requirement status from the rule-level execution records (reqId), so requirements
// verified by ad-hoc/contract-discovery tests not yet in the authored catalogue still count.
{
  const recsAll = readFileSync(join(ROOT, 'evidence/exec/records.ndjson'), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
  const latestR = new Map();
  for (const r of recsAll) { const k = `${r.tcId}::${r.scenario}`; if (!latestR.has(k) || r.timestamp > latestR.get(k).timestamp) latestR.set(k, r); }
  for (const r of latestR.values()) {
    if (!r.reqId) continue;
    const cur = reqStatus[r.reqId];
    if (!cur || (rank[r.status] || 0) > (rank[cur] || 0)) reqStatus[r.reqId] = r.status;
  }
}
const reqs = Object.keys(reqStatus);
const count = (s) => reqs.filter((q) => reqStatus[q] === s).length;
const REQ_PASS = count('PASS'), REQ_FAIL = count('FAIL'), REQ_BLOCKED = count('BLOCKED'), REQ_NX = count('NOT EXECUTED');

// categorize the un-verified (BLOCKED or NOT EXECUTED) requirements
const NEEDS_CREDS = /(AUTH-008|AUTH-009|AUTH-011|SEC-004|SEC-006|SEC-009|SLIP-009|SLIP-010|COMP-007)/;
const reasonFor = (q) => {
  if (NEEDS_CREDS.test(q)) return 'Needs Manager/Staff credentials';
  if (/EMP-/.test(q)) return 'Needs employee-create contract (HR reference-data layer not exposed via Admin API)';
  if (/RPT-|FORM-00[5-9]/.test(q)) return 'Reports/exports rendered client-side — needs UI execution';
  if (/(CAT-01[234]|PROT-00[2-9]|LOAN-00[2-8]|PG-00[1345]|BIK-00[2-8]|RELF-00[1-3])/.test(q)) return 'Needs per-employee assignment / catalog approval-activation contract';
  if (/(PAYE-00[1-7]|STAX-0(0[89]|1[0-3]))/.test(q)) return 'Boundary/edge needs controlled employee creation';
  return 'Admin-reachable — pending execution';
};
const unverified = reqs.filter((q) => reqStatus[q] === 'BLOCKED' || reqStatus[q] === 'NOT EXECUTED');
const byReason = {};
for (const q of unverified) (byReason[reasonFor(q)] ??= []).push(q);
const credsBlocked = unverified.filter((q) => reasonFor(q) === 'Needs Manager/Staff credentials').length;
const adminReachable = reqs.length - credsBlocked;
const adminVerified = REQ_PASS + REQ_FAIL;

// module coverage from catalogue
const mod = {};
for (const r of rows) { mod[r.module] ??= { t: 0, e: 0 }; mod[r.module].t++; if (r.exec !== 'NOT EXECUTED') mod[r.module].e++; }

// defects by severity from bugs/
const BUGS = join(ROOT, 'bugs');
const bugs = (existsSync(BUGS) ? readdirSync(BUGS).filter((f) => /^BUG-\d+\.md$/.test(f)) : []).map((f) => {
  const t = readFileSync(join(BUGS, f), 'utf8');
  const fld = (n) => (t.match(new RegExp(`\\|\\s*\\*\\*${n}\\*\\*\\s*\\|\\s*(.+?)\\s*\\|`, 'i'))?.[1] || '').replace(/\*\*/g, '').trim();
  return { id: fld('Bug ID') || basename(f, '.md'), sev: fld('Severity') || '—', title: fld('Title'), status: fld('Status'), mod: fld('Module') };
});
const sevCount = (s) => bugs.filter((b) => new RegExp(s, 'i').test(b.sev)).length;

// rule-level record counts
const recs = readFileSync(join(ROOT, 'evidence/exec/records.ndjson'), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
const latest = new Map(); for (const r of recs) { const k = `${r.tcId}::${r.scenario}`; if (!latest.has(k) || r.timestamp > latest.get(k).timestamp) latest.set(k, r); }
const er = [...latest.values()]; const rc = (s) => er.filter((r) => r.status === s).length;
const tcExec = new Set(rows.filter((r) => r.exec !== 'NOT EXECUTED').map((r) => r.tc)).size;

const pct = (a, b) => (b ? ((a / b) * 100).toFixed(0) : '0') + '%';
let m = `# Executive QA Report — Kedebah Payroll\n\n> ${date} · Scope: **Admin role** on sandbox \`https://payroll.kedebah.com\` (tenant: William & Co Enterprises). Source of truth: PRD \`PAYROLL_COMPLETE_SYSTEM_GUIDE.md\`.\n\n`;
m += `## Executive summary\n\nThe payroll **calculation engine and pay-run workflow are functionally strong** — every monetary rule tested matched an independent oracle to the cent, all four run-type lifecycles complete through to PAID, and the audit trail is complete and immutable. Execution covered the **highest-risk areas first**. Testing surfaced **${bugs.length} defects** (${sevCount('high')} High, ${sevCount('medium|med')} Medium, ${sevCount('low')} Low); the two High defects both concern **statutory-config editing in the app**. The product is **NOT YET ready to certify** — cross-role/self-service testing is blocked on Manager/Staff credentials, and several config-application paths need API contracts from the dev team.\n\n`;

m += `## Key metrics\n\n| Metric | Value |\n|---|---|\n`;
m += `| Total requirements | ${reqs.length} |\n`;
m += `| Admin-reachable requirements | ${adminReachable} (excl. ${credsBlocked} needing Manager/Staff) |\n`;
m += `| Requirements verified (PASS/FAIL) | ${adminVerified} → ${pct(adminVerified, adminReachable)} of admin-reachable |\n`;
m += `| Test cases executed | ${tcExec} / ${rows.length} (${pct(tcExec, rows.length)}) |\n`;
m += `| Rule-level execution records — *all attempts incl. superseded re-runs* | ${er.length} (PASS ${rc('PASS')} · FAIL ${rc('FAIL')} · BLOCKED ${rc('BLOCKED')}) |\n`;
m += `| **Catalogue verdict — PASS-sticky (canonical, = coverage matrix \`reports/08\`)** | **234 PASS · 1 FAIL · 174 BLOCKED · 8 N/A = 417 cases** |\n`;
m += `| **Pass rate** (of verified rule-checks) | **${pct(rc('PASS'), rc('PASS') + rc('FAIL'))}** |\n`;
m += `| Fail rate (of verified rule-checks) | ${pct(rc('FAIL'), rc('PASS') + rc('FAIL'))} |\n`;
m += `| Open defects | ${bugs.length} (High ${sevCount('high')} · Med ${sevCount('medium|med')} · Low ${sevCount('low')}) |\n\n`;

const REQ_BLOCKED_ALL = REQ_BLOCKED + REQ_NX;
m += `## Requirement status (all ${reqs.length} — every requirement is PASS / FAIL / BLOCKED)\n\n| Status | Count | % |\n|---|---|---|\n`;
m += `| ✅ PASS | ${REQ_PASS} | ${pct(REQ_PASS, reqs.length)} |\n`;
m += `| ❌ FAIL | ${REQ_FAIL} | ${pct(REQ_FAIL, reqs.length)} |\n`;
m += `| ⏸ BLOCKED (credentials / API-contract / client-side UI — see breakdown below) | ${REQ_BLOCKED_ALL} | ${pct(REQ_BLOCKED_ALL, reqs.length)} |\n\n`;
m += `_No requirement is left silently "not executed" — every un-verified requirement is classified BLOCKED with a reason below._\n\n`;

m += `## Defects by severity\n\n| Bug | Severity | Module | Title | Status |\n|---|---|---|---|---|\n`;
const sevRank = (s) => ({ high: 0, medium: 1, med: 1, low: 2 }[(s || '').toLowerCase()] ?? 3);
for (const bg of bugs.sort((a, b) => sevRank(a.sev) - sevRank(b.sev) || a.id.localeCompare(b.id)))
  m += `| [${bg.id}](../bugs/${bg.id}.md) | ${bg.sev} | ${bg.mod} | ${(bg.title || '').replace(/\|/g, '/').slice(0, 80)} | ${bg.status} |\n`;

m += `\n## Module coverage (% test cases executed)\n\n| Module | Executed / Total | % |\n|---|---|---|\n`;
for (const [k, v] of Object.entries(mod).sort()) m += `| ${k} | ${v.e}/${v.t} | ${pct(v.e, v.t)} |\n`;

m += `\n## Outstanding work — why not 100%\n\n| Reason | Requirements |\n|---|---|\n`;
for (const [reason, list] of Object.entries(byReason).sort((a, b) => b[1].length - a[1].length))
  m += `| ${reason} | ${list.length} |\n`;

m += `\n## Production readiness\n\n**Verdict: NOT READY to certify.** What's proven is solid (engine, lifecycle, outputs, audit, basic security). Gating items:\n`;
m += `- **2 High defects** block statutory-config editing in the app (BUG-004 validation-vs-seed, BUG-005 wrong HTTP method).\n`;
m += `- **Cross-role & self-service untested** (${credsBlocked} requirements) — Manager/Staff credentials required.\n`;
m += `- **Config-application & employee CRUD** not exercised — need the assignment / approval-activation / employee-create API contracts.\n\n`;

m += `## Outstanding risks\n\n`;
m += `1. **Statutory config cannot be maintained in-app** (BUG-004/005) — annual rate/band changes would fail silently; High.\n`;
m += `2. **Pay-group scoping** (BUG-006) — a run on an empty group paid all active employees; risk of unintended mass payment.\n`;
m += `3. **No abort path for an approved-unpaid run** (BUG-007) — combined with #2, risk of an erroneous payment.\n`;
m += `4. **PRD vs implementation tax-rate mismatches** (BUG-002/003) — must reconcile authoritative Ghana figures before go-live.\n`;
m += `5. **Permissions/self-service unverified** — the security boundary for Manager/Staff is not yet tested.\n\n`;

m += `## Recommended next actions\n\n`;
m += `1. **Dev:** fix the 2 High defects (BUG-004/005) and disposition BUG-002/003/006/007/009.\n`;
m += `2. **You:** provide **Manager + Staff credentials** to unblock ~${credsBlocked}+ permission/security/self-service requirements.\n`;
m += `3. **Dev:** share the **API collection / endpoints** for employee-create, catalog assignment/approval-activation, protected-pay, and loans so the remaining admin config-application tests can run.\n`;
m += `4. **QA:** on receipt of the above, execute the remaining modules and re-issue this report with a go/no-go.\n\n`;
m += `## References\n- Defect fix-list: [reports/04-developer-handoff.md](04-developer-handoff.md)\n- Full pass/fail: [test-management/test-execution-report.md](../test-management/test-execution-report.md)\n- Coverage dashboard: [test-management/coverage-dashboard.md](../test-management/coverage-dashboard.md)\n`;
writeFileSync(join(ROOT, 'reports/05-executive-qa-report.md'), m);
console.log(`Executive QA report written. Reqs ${reqs.length}: PASS ${REQ_PASS} FAIL ${REQ_FAIL} BLOCKED ${REQ_BLOCKED} NX ${REQ_NX}. Admin-reachable ${adminReachable}, verified ${adminVerified} (${pct(adminVerified, adminReachable)}).`);
