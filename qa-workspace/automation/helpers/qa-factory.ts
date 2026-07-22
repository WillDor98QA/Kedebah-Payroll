/**
 * qa-factory.ts — builders for live write-tests on throwaway `ZZ-QA` data.
 * Encapsulates the contracts reverse-engineered from the SPA bundle + network capture:
 *   - complete (processable) employee = create → set salary → PUT tax-profile TIN
 *   - catalog assignment            = PUT /employees/{id}/{benefits|deductions} {assignments:[…]}
 *   - off-cycle run                 = create → add staff → process → read → cancel (no calendar advance)
 *   - cleanup                       = deactivate (no hard-delete on employees: DELETE → 405)
 * All subjects are `ZZ-QA…` and are deactivated (employment_status → Terminated) by deactivateAll().
 */
import type { ApiClient } from './api-client.js';

const LOOKUP =
  '/employees/lookup-resources?resources=staff_titles,genders,marital_statuses,employment_types,employment_statuses,positions,departments,business_locations,countries,mobile_money_networks';

let _refs: any = null;
let _ghana = 84;
export async function refs(api: ApiClient): Promise<any> {
  if (_refs) return _refs;
  _refs = await api.json<any>(LOOKUP);
  _ghana = (_refs.countries || []).find((c: any) => /ghana/i.test(c.name))?.id ?? _refs.countries?.[0]?.id ?? 84;
  return _refs;
}
const pick = (D: any, k: string) => (Array.isArray(D[k]) && D[k].length ? D[k][0].id : null);

const created: number[] = []; // employee ids to deactivate at teardown

export interface MkOpts {
  basic?: number;
  salaryType?: string;
  salaryBody?: Record<string, unknown>;
  payment?: string;
  extra?: Record<string, unknown>;
  /** set false to skip the TIN step (e.g. to assert the readiness gate blocks an incomplete employee) */
  complete?: boolean;
}

export interface QaEmployee { id: number; staff: number; tin?: string; error?: any; body?: any; }

/** Create a COMPLETE, processable QA employee (or an incomplete one when opts.complete === false). */
export async function mkEmployee(api: ApiClient, sfx = '', opts: MkOpts = {}): Promise<QaEmployee> {
  const D = await refs(api);
  const t = `${Date.now()}${sfx}${Math.floor(Math.random() * 1000)}`;
  const body = {
    first_name: 'ZZQA', last_name: `W${sfx}`, preferred_name: 'ZZQA',
    employee_id: `ZZQA${sfx}${t.slice(-7)}`,
    work_email: `zzqa${sfx}${t}@example.com`, personal_email: `zzqap${sfx}${t}@example.com`,
    phone: `0249${t.slice(-6)}`,
    title_id: pick(D, 'staff_titles'), gender_id: pick(D, 'genders'), nationality_id: _ghana,
    marital_status_id: pick(D, 'marital_statuses'), employment_type_id: pick(D, 'employment_types'),
    employment_status_id: pick(D, 'employment_statuses'), position_id: pick(D, 'positions'),
    department_id: pick(D, 'departments'), work_location_id: pick(D, 'business_locations'),
    first_day_of_work: '2026-01-06', date_of_birth: '1995-05-05',
    payment_method: opts.payment ?? 'Cash', ...(opts.extra ?? {}),
  };
  const er = await api.call('post', '/employees', body);
  if (!er.data?.id) return { id: 0, staff: 0, error: er.body, body };
  const id = er.data.id;
  created.push(id);
  const det = await api.json<any>(`/employees/${id}`);
  const staff = det?.staff_id ?? id;
  const sal = opts.salaryBody ?? { salary_type: opts.salaryType ?? 'monthly', basic_salary: opts.basic ?? 3000, effective_date: '2026-01-06' };
  await api.call('post', `/employees/${id}/salary`, sal);
  let tin: string | undefined;
  if (opts.complete !== false) {
    const tp = await api.json<any>(`/employees/${id}/tax-profile/current`);
    if (tp?.id) {
      tin = `P00${t.slice(-8)}`;
      await api.call('put', `/employee-tax-profiles/${tp.id}`,
        { tin, ssnit_number: `C${t.slice(-12)}`, nhis_number: t.slice(-7), country_id: 84, effective_from: '2026-01-06' });
    }
  }
  return { id, staff, tin };
}

export const assignBenefit = (api: ApiClient, id: number, benefit_id: number, extra: Record<string, unknown> = {}) =>
  api.call('put', `/employees/${id}/benefits`, { assignments: [{ benefit_id, start_date: '2026-01-06', is_active: true, ...extra }] });
export const assignDeduction = (api: ApiClient, id: number, deduction_id: number, extra: Record<string, unknown> = {}) =>
  api.call('put', `/employees/${id}/deductions`, { assignments: [{ deduction_id, start_date: '2026-01-06', is_active: true, ...extra }] });

export async function mkBenefit(api: ApiClient, o: Record<string, unknown>) {
  const r = await api.call('post', '/benefits', { status: 'active', component_category: 'earning', tax_treatment: 'taxable', ...o });
  return { id: r.data?.id as number | undefined, r };
}
export async function mkDeduction(api: ApiClient, o: Record<string, unknown>) {
  const r = await api.call('post', '/deductions', { status: 'active', calculation_method: 'fixed_amount', ...o });
  return { id: r.data?.id as number | undefined, r };
}

export interface RunResult { rid: number; proc: any; list: any[]; e: any; cancel: () => Promise<any>; validation: any; }

/** Create an off-cycle run, add staff, read process-validation, process, return the computed employee. */
export async function runOffCycle(api: ApiClient, staffIds: number | number[], flags: Record<string, unknown> = {}): Promise<RunResult> {
  const periods = await api.json<any[]>('/payroll-periods?paginate=false');
  const period = periods.find((p) => /scheduled/i.test(p.status)) ?? periods[periods.length - 1];
  const run = await api.call('post', '/pay-runs', {
    name: 'ZZ-QA Live', type: 'off_cycle', payroll_period_id: period.id, currency_code: 'GHS',
    off_cycle_include_basic: true, off_cycle_include_benefits: true, off_cycle_include_deductions: true, ...flags,
  });
  const rid = run.data?.id;
  const ids = Array.isArray(staffIds) ? staffIds : [staffIds];
  await api.call('post', `/pay-runs/${rid}/employees`, { staff_ids: ids });
  const validation = (await api.call('get', `/pay-runs/${rid}/process-validation`)).data;
  const proc = await api.call('post', `/pay-runs/${rid}/process`, { exclude_incomplete_employees: false });
  await new Promise((r) => setTimeout(r, 3500));
  const list = (await api.json<any[]>(`/pay-runs/${rid}/employees`)) ?? [];
  return { rid, proc, list, validation, e: list.find((x) => ids.includes(x.staff_id)) ?? list[0], cancel: () => api.call('post', `/pay-runs/${rid}/cancel`, { reason: 'QA cleanup' }) };
}

/** Deactivate every employee this factory created (no hard-delete API). Call in afterAll. */
export async function deactivateAll(api: ApiClient): Promise<{ deactivated: number; total: number }> {
  const statuses = (await api.json<any>('/employees/lookup-resources?resources=employment_statuses'))?.employment_statuses ?? [];
  const terminated = statuses.find((s: any) => /terminat/i.test(s.name))?.id;
  let n = 0;
  for (const id of created) {
    const r = await api.call('put', `/employees/${id}`, { first_name: 'ZZQA-DEACTIVATED', status: 'inactive', ...(terminated ? { employment_status_id: terminated } : {}) });
    if (r.ok) n++;
  }
  const total = created.length;
  created.length = 0;
  return { deactivated: n, total };
}

/**
 * Regular Payroll Harness (PERMANENT framework capability).
 * Drives the full Regular lifecycle discovered live: create → process → submit-for-approval → approve →
 * mark-as-paid. NOTE (engine behaviour, verified live): a Regular run auto-populates ALL active employees
 * and marking it PAID advances the org calendar to the next period and decrements every active loan.
 * Because it cannot be scoped to a single employee without pay-group membership (unexposed contract),
 * this harness is wide-impact; production verification of paid-run side-effects reads the most recent
 * completed Regular run rather than triggering repeated calendar advances. Transition endpoints:
 *   POST /pay-runs/{id}/submit-for-approval · /approve · /mark-as-paid {payment_method:'cash'|'bank'}.
 */
export async function runRegularToPaid(api: ApiClient, opts: { paymentMethod?: 'cash' | 'bank' } = {}): Promise<any> {
  const periods = await api.json<any[]>('/payroll-periods?paginate=false');
  const period = periods.find((p) => /scheduled/i.test(p.status)) ?? periods[periods.length - 1];
  const run = await api.call('post', '/pay-runs', { name: `AIQA_REGULAR_${Date.now()}`, type: 'regular', payroll_period_id: period.id, currency_code: 'GHS' });
  const rid = run.data?.id;
  if (!rid) return { rid: 0, error: run.body };
  await api.call('post', `/pay-runs/${rid}/process`, { exclude_incomplete_employees: true });
  await new Promise((r) => setTimeout(r, 3500));
  const submit = await api.call('post', `/pay-runs/${rid}/submit-for-approval`, { comments: 'AIQA harness' });
  const approve = await api.call('post', `/pay-runs/${rid}/approve`, { comments: 'AIQA harness approve' });
  const paid = await api.call('post', `/pay-runs/${rid}/mark-as-paid`, { payment_method: opts.paymentMethod ?? 'cash', payment_reference: `AIQA_${Date.now()}` });
  const employees = (await api.json<any[]>(`/pay-runs/${rid}/employees`)) ?? [];
  const detail = await api.json<any>(`/pay-runs/${rid}`);
  return { rid, period, submitStatus: submit.status, approveStatus: approve.status, paidStatus: paid.status, detail, employees };
}

/** Most recent completed Regular run (read-only) — for verifying paid-run side-effects without mutating. */
export async function latestPaidRegular(api: ApiClient): Promise<any | null> {
  const runs = await api.json<any[]>('/pay-runs?paginate=false');
  return (runs ?? []).find((r) => /regular/i.test(r.type ?? '') && /paid/i.test(r.status ?? '')) ?? null;
}

export interface MkRunOpts { type?: 'off_cycle' | 'bonus' | 'termination'; flags?: Record<string, unknown>; bonusType?: string; bonusAmount?: number; lastDay?: string; process?: boolean; excludeIncomplete?: boolean; }
/**
 * Reusable run fixture (PERMANENT). Creates a draft run of the requested type, adds staff, captures the
 * draft process-validation (incomplete/ineligible breakdown), then optionally processes (with or without
 * excluding incomplete employees) and returns the computed employees. Supports off_cycle / bonus /
 * termination. Reuse for validation-persona, run-type, special-tax and lifecycle cases.
 */
export async function mkRun(api: ApiClient, staffIds: number | number[], opts: MkRunOpts = {}): Promise<any> {
  const periods = await api.json<any[]>('/payroll-periods?paginate=false');
  const period = periods.find((p) => /scheduled/i.test(p.status)) ?? periods[periods.length - 1];
  const type = opts.type ?? 'off_cycle';
  const base: Record<string, unknown> =
    type === 'bonus' ? { type: 'bonus', bonus_type: opts.bonusType ?? 'fixed', bonus_fixed_amount: opts.bonusAmount ?? 4000 } :
    type === 'termination' ? { type: 'termination', termination_last_working_day: opts.lastDay ?? '2026-06-30', off_cycle_include_basic: true } :
    { type: 'off_cycle', off_cycle_include_basic: true, off_cycle_include_benefits: true, off_cycle_include_deductions: true, off_cycle_include_loans: true };
  const run = await api.call('post', '/pay-runs', { name: `AIQA_${type.toUpperCase()}_${Date.now()}`, payroll_period_id: period.id, currency_code: 'GHS', ...base, ...(opts.flags ?? {}) });
  const rid = run.data?.id;
  if (!rid) return { rid: 0, error: run.body };
  const ids = Array.isArray(staffIds) ? staffIds : [staffIds];
  await api.call('post', `/pay-runs/${rid}/employees`, { staff_ids: ids });
  const validation = (await api.call('get', `/pay-runs/${rid}/process-validation`)).data;
  const cancel = () => api.call('post', `/pay-runs/${rid}/cancel`, { reason: 'AIQA cleanup' });
  if (opts.process === false) return { rid, validation, cancel };
  const proc = await api.call('post', `/pay-runs/${rid}/process`, { exclude_incomplete_employees: opts.excludeIncomplete ?? false });
  await new Promise((r) => setTimeout(r, 3500));
  const list = (await api.json<any[]>(`/pay-runs/${rid}/employees`)) ?? [];
  return { rid, validation, proc, list, e: list.find((x) => ids.includes(x.staff_id)) ?? list[0], cancel };
}
