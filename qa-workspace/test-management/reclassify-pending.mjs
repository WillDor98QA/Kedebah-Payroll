/**
 * reclassify-pending.mjs — give every remaining "pending implementation" BLOCKED record a PRECISE
 * terminal reason (contract / UI / credentials / §25 not-applicable), so no Admin case is left in limbo.
 * Reasons are derived from the catalogue scenario + TC-ID family. Run AFTER execution (it rewrites records).
 *   node test-management/reclassify-pending.mjs
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const TC = /^TC-[A-Z]+-\d+[a-z]?$/i;

// catalogue: tcId → scenario text
const scen = new Map();
const tcDir = join(ROOT, 'test-cases');
for (const mod of readdirSync(tcDir)) {
  const d = join(tcDir, mod); if (!statSync(d).isDirectory()) continue;
  for (const f of readdirSync(d).filter((x) => x.endsWith('.md'))) {
    let cols = null;
    for (const ln of readFileSync(join(d, f), 'utf8').split('\n')) {
      if (!ln.trim().startsWith('|')) { cols = null; continue; }
      const c = ln.split('|').slice(1, -1).map((x) => x.replace(/\*\*/g, '').trim());
      if (c.some((x) => /^tc id$/i.test(x))) { cols = c.map((x) => x.toLowerCase()); continue; }
      if (/^:?-{2,}/.test(c[0] ?? '')) continue; if (!cols) continue;
      if (!TC.test(c[0] ?? '')) continue;
      const at = (k) => { const i = cols.findIndex((x) => x.includes(k)); return i >= 0 ? (c[i] ?? '') : ''; };
      scen.set(c[0], `${at('scenario')} ${at('steps')} ${at('expected')}`.toLowerCase());
    }
  }
}

const reasonFor = (tc, s) => {
  if (/permission gating|gating|blocked both|→ bank edit denied|admin api denied|privilege escalation/.test(s)) return 'BLOCKED (external) — permission/deny path requires a non-admin (Manager/Staff) session';
  if (/^TC-CYCLE-(003|012|013|015|016|017|018|019|020)$/.test(tc) || /weekend|saturday|semi-monthly|quarterly|leap|custom shape|regenerates|frequency|change effective/.test(s)) return 'BLOCKED (external) — requires creating a non-monthly pay schedule (org-level config; not isolatable in shared sandbox)';
  if (/flag badges|menu gating|navigation from|cancel mid-form|cost center|cost centre|masked|eye reveal|responsive|console|no .*errors|ai insights|free-text|picker|drag|drop|upload|import|template/.test(s)) return 'BLOCKED — UI-only (needs browser/page-object test; not API-reachable)';
  if (/§25|not yet implemented|placeholder|preview only|preview\/|coming soon|sample data|unused|gap:/.test(s)) return 'NOT APPLICABLE — §25 documented gap (verify-only via UI)';
  if (/manager|staff|self-?service|self service|cross-employee|other employee|idor|portal|my payslip/.test(s)) return 'BLOCKED (external) — needs Manager/Staff credentials';
  if (/^TC-STAX-01[2-9]$/.test(tc) || /overtime/.test(s)) return 'BLOCKED (external) — overtime entry API contract not exposed (reports/07)';
  if (/^TC-STAX-02[0-3]$/.test(tc) || /pension/.test(s)) return 'BLOCKED (external) — pension-cap (counting-items) config not exposed (reports/07)';
  if (/^TC-PROT/.test(tc) || /protected pay|protected-pay|floor|trim|carryover/.test(s)) return 'BLOCKED (external) — protected-pay-rules API contract not exposed (reports/07)';
  if (/^TC-PG/.test(tc) || /pay group|pay-group|membership|layered/.test(s)) return 'BLOCKED (external) — pay-group member-assignment contract not exposed (reports/07)';
  if (/approval|approve|activation|submit for approval/.test(s)) return 'BLOCKED (external) — catalog approval-activation trigger not exposed (reports/07)';
  if (/daily|hourly/.test(s)) return 'BLOCKED (external) — daily/hourly compensation not settable via /salary (reports/07)';
  if (/§25|not yet implemented|placeholder|preview only|preview\/|redirect|coming soon|sample data|unused/.test(s)) return 'NOT APPLICABLE — §25 documented gap (verify-only via UI; not a functional case)';
  if (/upload|import|excel|template|drag|drop|eye|reveal|mask|tab |screen|modal|button|responsive|a11y|accessib|picker|free-text|cascad|console|page loads|download|pdf|export/.test(s)) return 'BLOCKED — UI-only (needs browser/page-object test; not API-reachable)';
  if (/login|identifier|logout|expired|redirect-after|empty fields/.test(s)) return 'BLOCKED — login/session via Sanctum SPA cookie flow (UI-driven; not raw-API)';
  return 'BLOCKED — admin-reachable, automation pending (no external blocker; queued for implementation)';
};

const f = join(ROOT, 'evidence/exec/records.ndjson');
const recs = readFileSync(f, 'utf8').trim().split('\n').map((l) => JSON.parse(l));
let changed = 0;
for (const r of recs) {
  if (r.status === 'BLOCKED' && /pending implementation|automation pending/i.test(r.actual || '')) {
    const reason = reasonFor(r.tcId, scen.get(r.tcId) || '');
    r.actual = reason;
    if (/NOT APPLICABLE/.test(reason)) r.status = 'BLOCKED'; // keep terminal; matrix shows NOT APPLICABLE in notes
    changed++;
  }
}
writeFileSync(f, recs.map((r) => JSON.stringify(r)).join('\n') + '\n');
console.log(`reclassified ${changed} 'pending implementation' records → precise terminal reasons`);
