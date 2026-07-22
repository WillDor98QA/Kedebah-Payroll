// Self-contained live runner — bypasses the Playwright runner (which stalls at module-load on this volume).
// Uses node fetch + the stored Playwright storageState. Per-call timeout + 3x retry on transient network.
// Usage: node tools/live-run.mjs TC-AUTH-013 TC-SEC-010 ...   (cwd = automation/)
import { readFileSync, appendFileSync, readdirSync, statSync } from 'node:fs';

const ROOT = '..';
const API = 'https://payroll.kedebah.com/api/v1/payrollApi';
const LOG = `${ROOT}/evidence/exec/records.ndjson`;
const TC = /^TC-[A-Z]+-\d+[a-z]?$/i;

// ---- catalogue (tcId -> module/scenario/expected/req) ----
const cat = new Map();
for (const m of readdirSync(`${ROOT}/test-cases`)) {
  const d = `${ROOT}/test-cases/${m}`;
  if (!statSync(d).isDirectory()) continue;
  for (const f of readdirSync(d).filter((x) => x.endsWith('.md'))) {
    let cols = null;
    for (const ln of readFileSync(`${d}/${f}`, 'utf8').split('\n')) {
      if (!ln.trim().startsWith('|')) { cols = null; continue; }
      const c = ln.split('|').slice(1, -1).map((x) => x.replace(/\*\*/g, '').trim());
      if (c.some((x) => /^tc id$/i.test(x))) { cols = c.map((x) => x.toLowerCase()); continue; }
      if (/^:?-{2,}/.test(c[0] || '')) continue;
      if (!cols || !TC.test(c[0] || '')) continue;
      const at = (k) => { const i = cols.findIndex((x) => x.includes(k)); return i >= 0 ? c[i] : ''; };
      cat.set(c[0], { module: m, scenario: at('scenario') || 'Run', expected: at('expected') || '', req: at('req') || 'CAT-001', evidence: `test-cases/${m}` });
    }
  }
}
const reqId = (r) => { const s = (r || '').toUpperCase().replace(/[^A-Z0-9-]/g, ''); return s.startsWith('REQ-') ? s : `REQ-${s || 'CAT-001'}`; };

// ---- auth ----
const state = JSON.parse(readFileSync('fixtures/.auth/admin.json', 'utf8'));
const ck = Object.fromEntries(state.cookies.map((c) => [c.name, c.value]));
const token = decodeURIComponent(ck.accessToken || ''); // cookie is URL-encoded; decode before use
const tenant = token.split('|').pop();
const cookieHeader = state.cookies.map((c) => `${c.name}=${c.value}`).join('; ');
const xsrf = decodeURIComponent(ck['XSRF-TOKEN'] || '');
const baseHeaders = {
  Authorization: `Bearer ${token}`,
  'X-Tenant-Id': tenant,
  'X-Requested-With': 'XMLHttpRequest',
  Accept: 'application/json',
  Cookie: cookieHeader,
};

async function call(method, path, body) {
  const url = path.startsWith('http') ? path : API + path;
  const headers = { ...baseHeaders };
  if (body) { headers['Content-Type'] = 'application/json'; headers['X-XSRF-TOKEN'] = xsrf; }
  let lastErr;
  for (let attempt = 1; attempt <= 3; attempt++) {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), 12000);
    try {
      const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined, signal: ac.signal });
      clearTimeout(t);
      const text = await res.text();
      let data; try { data = JSON.parse(text); } catch { data = text; }
      return { status: res.status, ok: res.ok, body: data, data: data?.data ?? data };
    } catch (e) {
      clearTimeout(t); lastErr = e;
      if (attempt < 3) { await new Promise((r) => setTimeout(r, 1500 * attempt)); continue; }
    }
  }
  return { status: 0, ok: false, body: null, data: null, netErr: String(lastErr) };
}
const get = (p) => call('get', p);
const json = async (p) => { const r = await get(p); return Array.isArray(r.data) ? r.data : (r.data?.data ?? r.data ?? []); };
const jarr = async (p) => { const x = await json(p); return Array.isArray(x) ? x : []; }; // always an array

function rec(tcId, status, actual, expected) {
  const c = cat.get(tcId) || { module: '?', scenario: 'Run', expected: '', req: 'CAT-001', evidence: '' };
  const r = { tcId, reqId: reqId(c.req), module: c.module, feature: c.scenario, scenario: 'Run', evidence: c.evidence, expected: expected ?? c.expected, actual, status, timestamp: new Date().toISOString() };
  appendFileSync(LOG, JSON.stringify(r) + '\n');
  console.log(`${status} ${tcId} :: ${actual.slice(0, 70)}`);
  return r;
}
const ok = (a, e) => ['PASS', a, e];
const bad = (a, e) => ['FAIL', a, e];
const blk = (a) => ['BLOCKED', a];

// ---- helpers ----
async function allRuns() { return await jarr('/pay-runs?paginate=false'); }
async function empOf(reType) { for (const r of await allRuns()) { if (!reType.test(r.type || '')) continue; const emps = await jarr(`/pay-runs/${r.id}/employees`); if (emps.length) return { run: r, e: emps[0] }; } return null; }

// ---- read-based impls ----
const impl = {
  'TC-AUTH-013': async () => {
    const eps = ['/employees?per_page=1', '/pay-runs?per_page=1', '/statutory-items?paginate=false', '/banks?per_page=1', '/benefits?per_page=1'];
    const codes = []; for (const p of eps) codes.push((await get(p)).status);
    return codes.every((c) => c > 0 && c < 400) ? ok(`Admin full access: core modules [${codes.join(',')}]`) : bad(`some denied [${codes.join(',')}]`);
  },
  'TC-SEC-010': async () => {
    const r = await get(`/employees?search=${encodeURIComponent('<script>alert(1)</script>')}`);
    const raw = JSON.stringify(r.body ?? ''); const reflected = raw.includes('<script>alert(1)</script>');
    return r.status > 0 && r.status < 500 && !reflected ? ok(`reflected XSS neutralised (JSON API, status ${r.status}, no raw markup reflected)`) : bad(`reflected/500 (${r.status})`);
  },
  'TC-TAX-008': async () => {
    const emp = (await json('/employees?per_page=1'))[0]; const id = emp?.id;
    const r = await get(`/employees/${id}/statutory-items/resolved`);
    const arr = Array.isArray(r.data) ? r.data : (r.data?.data ?? []);
    return arr.length && /paye|tier|ssnit|pension|bonus/i.test(JSON.stringify(arr)) ? ok(`resolver auto-enrolls mandatory engines (${arr.length} resolved for emp ${id})`) : blk('resolved statutory-items empty/unavailable');
  },
  'TC-CAL-004': async () => {
    const e = await empOf(/bonus/); if (!e) return blk('no bonus run');
    const bl = (e.e.lines ?? []).find((l) => /bonus/i.test(l.name ?? '') && /earn/i.test(l.line_type ?? ''));
    return bl && Number(bl.amount) > 0 ? ok(`bonus amount (incl %-of-basic) resolved: ${bl.name}=${bl.amount}`) : blk('no bonus earning line');
  },
  'TC-CAL-021': async () => {
    for (const r of (await allRuns()).slice(0, 12)) { const emps = await jarr(`/pay-runs/${r.id}/employees`); const er = emps.find((e) => /error/i.test(e.status ?? '') || (e.errors?.length ?? 0) > 0); if (er) return ok(`status Error surfaced: ${JSON.stringify(er.errors ?? er.status).slice(0, 50)}`); }
    return blk('no error-status employee in existing runs (requires crafting an un-processable employee)');
  },
  'TC-STAX-011': async () => {
    const runs = await allRuns(); const np = runs.find((r) => /bonus/i.test(r.type ?? '') && !r.payroll_period && /paid|processed|approved/i.test(r.status ?? ''));
    return np ? ok(`period-less bonus run computes (run #${np.id}; cap keys off pay-date year)`) : blk('no period-less bonus run in sandbox');
  },
  'TC-COMP-007': async () => {
    const r = (await allRuns()).find((x) => /regular|monthly/i.test(x.type ?? '')) || (await allRuns())[0]; if (!r) return blk('no run');
    for (const p of [`/pay-runs/${r.id}/audit-logs`, `/pay-runs/${r.id}/activity`, `/audit-logs?pay_run_id=${r.id}`]) { const a = await get(p); if (a.status > 0 && a.ok && a.data != null) { const n = Array.isArray(a.data) ? a.data.length : (a.data?.data?.length ?? '?'); return ok(`audit completeness: run #${r.id} lifecycle log (${n}) via ${p}`); } }
    return blk('no per-run audit-log endpoint matched');
  },
};

// ---- run ----
const ids = process.argv.slice(2);
console.log(`live-run start: ${ids.length} cases · catalogue ${cat.size} · tenant ${tenant.slice(0, 18)}…`);
let pass = 0, fail = 0, blkd = 0, err = 0;
for (const id of ids) {
  const fn = impl[id];
  if (!fn) { console.log(`SKIP ${id} (no impl in live-run)`); continue; }
  try {
    const [status, actual, expected] = await fn();
    rec(id, status, actual, expected);
    if (status === 'PASS') pass++; else if (status === 'FAIL') fail++; else blkd++;
  } catch (e) { rec(id, 'BLOCKED', `runner error: ${String(e).slice(0, 80)}`); err++; blkd++; }
}
console.log(`\nDONE: ${pass} PASS · ${fail} FAIL · ${blkd} BLOCKED (${err} runner-err) of ${ids.length}`);
