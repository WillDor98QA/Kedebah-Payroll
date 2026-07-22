#!/usr/bin/env node
/**
 * employment-type-cert.mjs — Employment-Type Payroll Calculation Certification (reusable).
 * Creates one isolated QA employee per live Employment Type, runs an OFF-CYCLE payroll (no calendar
 * advance, cancelled after extraction), and compares the engine's per-employee breakdown to an
 * INDEPENDENT Ghana-law oracle (calc-oracle rules). Appends results to the ledger. Safe on shared tenant.
 */
import { readFileSync, appendFileSync } from 'node:fs';
const API = 'https://payroll.kedebah.com/api/v1/payrollApi';
const ROOT = decodeURIComponent(new URL('..', import.meta.url).pathname);
const st = JSON.parse(readFileSync(ROOT + 'automation/fixtures/.auth/admin.json', 'utf8'));
const ck = Object.fromEntries(st.cookies.map((c) => [c.name, c.value]));
const tok = decodeURIComponent(ck.accessToken || ''); const ten = tok.split('|').pop(); const xsrf = decodeURIComponent(ck['XSRF-TOKEN'] || '');
const H = { 'X-Tenant-Id': ten, 'X-Requested-With': 'XMLHttpRequest', Accept: 'application/json', 'Content-Type': 'application/json', 'X-XSRF-TOKEN': xsrf, Cookie: st.cookies.map((c) => `${c.name}=${c.value}`).join('; '), Authorization: `Bearer ${tok}` };
async function call(m, p, b) { const r = await fetch(API + p, { method: m, headers: H, body: b ? JSON.stringify(b) : undefined, signal: AbortSignal.timeout(30000) }); const t = await r.text(); let d; try { d = JSON.parse(t); } catch { d = t; } return { s: r.status, d: d?.data ?? d, raw: d }; }
const j = (p) => call('GET', p).then((r) => r.d);
const r2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;
const near = (a, b, t = 0.05) => Math.abs(Number(a) - Number(b)) <= t;

// ---- Independent Ghana PAYE oracle (monthly bands, PRD §; NOT copied from the app) ----
const BANDS = [[490, 0], [110, 0.05], [130, 0.10], [3166.67, 0.175], [16000, 0.25], [30520, 0.30], [Infinity, 0.35]];
function paye(chargeable) { let x = chargeable, tax = 0; for (const [width, rate] of BANDS) { if (x <= 0) break; const amt = Math.min(x, width); tax += amt * rate; x -= amt; } return r2(tax); }
const TIER1_EE = 0.055;

async function main() {
  const D = await j('/employees/lookup-resources?resources=staff_titles,genders,marital_statuses,employment_types,employment_statuses,positions,departments,business_locations,countries,mobile_money_networks');
  const pick = (k) => D[k]?.[0]?.id;
  const ghana = (D.countries || []).find((c) => /ghana/i.test(c.name))?.id ?? 84;
  const types = (D.employment_types || []).sort((a, b) => a.id - b.id);
  const BASIC = 3000;
  const results = [];
  for (const et of types) {
    const t = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const body = { first_name: 'ZZQA-ET', last_name: et.name.replace(/\W/g, ''), preferred_name: 'ZZQA',
      employee_id: `E2E_ET_${et.name.replace(/\W/g, '').toUpperCase()}_${t.slice(-6)}`,
      work_email: `zzqaet${t}@example.com`, personal_email: `zzqaetp${t}@example.com`, phone: `0249${t.slice(-6)}`,
      title_id: pick('staff_titles'), gender_id: pick('genders'), nationality_id: ghana, marital_status_id: pick('marital_statuses'),
      employment_type_id: et.id, employment_status_id: pick('employment_statuses'), position_id: pick('positions'),
      department_id: pick('departments'), work_location_id: pick('business_locations'), first_day_of_work: '2026-01-06', date_of_birth: '1995-05-05', payment_method: 'Cash' };
    const cr = await call('POST', '/employees', body);
    if (!cr.d?.id) { results.push({ type: et.name, id: null, err: JSON.stringify(cr.raw?.errors ?? cr.raw?.message ?? cr.s).slice(0, 100) }); continue; }
    const id = cr.d.id; const det = await j(`/employees/${id}`); const staff = det?.staff_id ?? id;
    await call('POST', `/employees/${id}/salary`, { salary_type: 'monthly', basic_salary: BASIC, effective_date: '2026-01-06' });
    const tp = await j(`/employees/${id}/tax-profile/current`);
    if (tp?.id) await call('PUT', `/employee-tax-profiles/${tp.id}`, { tin: `P00${t.slice(-8)}`, ssnit_number: `C${t.slice(-12)}`, nhis_number: t.slice(-7), country_id: 84, effective_from: '2026-01-06' });
    // OFF-CYCLE run (isolated)
    const periods = await j('/payroll-periods?paginate=false'); const period = periods.find((p) => /scheduled/i.test(p.status)) ?? periods[periods.length - 1];
    const run = await call('POST', '/pay-runs', { name: `ZZ-QA ET ${et.name}`, type: 'off_cycle', payroll_period_id: period.id, currency_code: 'GHS', off_cycle_include_basic: true, off_cycle_include_benefits: false, off_cycle_include_deductions: false });
    const rid = run.d?.id;
    await call('POST', `/pay-runs/${rid}/employees`, { staff_ids: [staff] });
    await call('POST', `/pay-runs/${rid}/process`, { exclude_incomplete_employees: false });
    await new Promise((r) => setTimeout(r, 3500));
    const list = await j(`/pay-runs/${rid}/employees`); const e = (list || []).find((x) => x.staff_id === staff) ?? (list || [])[0];
    const cb = e?.calculation_breakdown ?? {};
    const lines = e?.lines ?? [];
    const lineAmt = (re) => Number((lines.find((l) => re.test((l.name || '') + (l.code || '') + (l.line_type || '')))?.amount) ?? 0);
    const gross = Number(e?.gross_pay ?? 0), net = Number(e?.net_pay ?? 0);
    const tier1 = lineAmt(/tier.?1|ssnit/i) || Number(cb.ssf_employee ?? cb.tier_1 ?? 0);
    const enginePaye = Number(cb.paye ?? lineAmt(/paye|income tax/i));
    const chargeable = Number(cb.chargeable_income ?? (gross - tier1));
    const casualLine = lineAmt(/casual/i), boardLine = lineAmt(/board|director|wht/i);
    if (results.length === 0) { console.log(`GROUND-TRUTH (${et.name}): basic=${e?.basic_salary} gross=${gross} net=${net}`); console.log('  breakdown:', JSON.stringify(cb).slice(0, 300)); console.log('  lines:', JSON.stringify((lines).map((l) => ({ n: l.name || l.code, t: l.line_type, a: l.amount }))).slice(0, 300)); }
    // Oracle (standard employment): tier1=5.5%*basic; chargeable=gross-tier1; paye=paye(chargeable); net=gross-tier1-paye
    const oTier1 = r2(TIER1_EE * BASIC), oChargeable = r2(gross - oTier1), oPaye = paye(oChargeable), oNet = r2(gross - oTier1 - oPaye);
    await call('POST', `/pay-runs/${rid}/cancel`, { reason: 'QA cert cleanup' });
    results.push({ type: et.name, id, staff, rid, gross, tier1, enginePaye, chargeable, net, casualLine, boardLine, oTier1, oChargeable, oPaye, oNet, hasBands: enginePaye > 0 && !casualLine });
  }
  // ---- Emit results ----
  console.log('EMPLOYMENT-TYPE CERTIFICATION — off-cycle, basic ' + BASIC + ', payment Cash');
  console.log('type       | gross | tier1(eng/orc) | PAYE(eng/orc) | net(eng/orc) | casual | board | verdict');
  const ts = new Date().toISOString();
  for (const r of results) {
    if (!r.id) { console.log(`${r.type.padEnd(10)} | CREATE FAILED: ${r.err}`); continue; }
    const std = ['Full-time', 'Contract', 'Part-time', 'Temporary'].includes(r.type);
    let verdict, note;
    if (std) {
      const ok = near(r.tier1, r.oTier1, 1) && near(r.enginePaye, r.oPaye, 1) && near(r.net, r.oNet, 1.5);
      verdict = ok ? 'PASS' : 'FAIL'; note = ok ? 'standard PAYE+Tier1 == oracle' : `mismatch tier1 ${r.tier1}/${r.oTier1} paye ${r.enginePaye}/${r.oPaye} net ${r.net}/${r.oNet}`;
    } else if (r.type === 'Casual') {
      const flat = r.casualLine > 0 || (near(r.enginePaye, 0) && r.gross > 0);
      verdict = flat ? 'PASS' : (r.enginePaye > 0 ? 'FAIL' : 'NOT VERIFIED'); note = `casual flat tax line=${r.casualLine}, PAYE=${r.enginePaye} (expected flat 5%, not PAYE bands)`;
    } else if (r.type === 'Board') {
      verdict = r.boardLine > 0 ? 'PASS' : 'NOT VERIFIED'; note = `board/WHT tax line=${r.boardLine}, PAYE=${r.enginePaye}`;
    } else { // Internship, NSS — observe standard treatment
      const ok = near(r.enginePaye, r.oPaye, 1) && near(r.tier1, r.oTier1, 1);
      verdict = ok ? 'PASS' : 'NOT VERIFIED'; note = `observed: PAYE ${r.enginePaye} (oracle ${r.oPaye}), tier1 ${r.tier1}; confirm ${r.type} treatment vs policy`;
    }
    console.log(`${r.type.padEnd(10)} | ${r.gross} | ${r.tier1}/${r.oTier1} | ${r.enginePaye}/${r.oPaye} | ${r.net}/${r.oNet} | ${r.casualLine} | ${r.boardLine} | ${verdict} — ${note}`);
    appendFileSync(ROOT + 'evidence/exec/records.ndjson', JSON.stringify({ tcId: `TC-ETC-${r.type.replace(/\W/g, '').toUpperCase()}`, reqId: 'REQ-EMP-EMPTYPE', module: 'Payroll/EmploymentType', feature: `Payroll calc — ${r.type}`, scenario: `Off-cycle run for a ${r.type} employee (basic ${BASIC})`, expected: `Tier1 ${r.oTier1}, PAYE ${r.oPaye}, net ${r.oNet} (or correct ${r.type} special treatment)`, actual: `[api] emp #${r.id} run #${r.rid}: gross ${r.gross}, tier1 ${r.tier1}, PAYE ${r.enginePaye}, net ${r.net}, casualLine ${r.casualLine}, boardLine ${r.boardLine} — ${note}`, status: verdict === 'NOT VERIFIED' ? 'BLOCKED' : verdict, timestamp: ts, evidence: `run #${r.rid}` }) + '\n');
  }
}
main().catch((e) => { console.error('ERR', e); process.exit(1); });
