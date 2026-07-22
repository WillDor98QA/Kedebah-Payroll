/**
 * catalogue-coverage.spec.ts — guard: the suite must stay 1:1 with the test-cases/*.md catalogue.
 * Parses every module folder and asserts the documented TC-ID count is unchanged (417 total).
 * Pure file parsing — no app needed (runs in the `unit` project). If a module's .md grows/shrinks,
 * this fails until the expected count is updated, flagging that new cases need a test/registry entry.
 */
import { test, expect } from '@playwright/test';
import { parseModule } from '../../helpers/tc-catalogue.js';

const EXPECTED: Record<string, number> = {
  Authentication: 19, Benefits: 32, Compliance: 10, Dashboard: 5, Deductions: 25,
  Employees: 34, Loans: 16, 'Pay Groups': 12, Payroll: 204, Reports: 15, Security: 18, Tax: 27,
};

test('catalogue is fully enumerated — every module .md maps 1:1 (417 cases) @guard', () => {
  let total = 0;
  const report: string[] = [];
  for (const [mod, n] of Object.entries(EXPECTED)) {
    const rows = parseModule(`../test-cases/${mod}`, mod);
    report.push(`${mod}: ${rows.length}/${n}`);
    expect(rows.length, `${mod} parsed ${rows.length}, expected ${n}`).toBe(n);
    // no duplicate TC-IDs within a module
    const ids = new Set(rows.map((r) => r.tcId));
    expect(ids.size, `${mod} has duplicate TC-IDs`).toBe(rows.length);
    total += rows.length;
  }
  expect(total, `total cases (${report.join(', ')})`).toBe(417);
});
