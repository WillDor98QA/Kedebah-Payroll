/**
 * case-runner.ts — shared dispatcher used by the permanent per-file specs (tests/<module>/*.cases.spec.ts).
 * Each spec calls runCase(api, 'TC-XXX') for every documented case. This looks the case up in the
 * catalogue, dispatches to its implementation in tc-registry.ts (real assertion vs the live app/oracle),
 * or skips it with a precise documented reason — and records the outcome for the reports. Keeping the
 * implementations in one registry (not duplicated across 22 files) is what keeps the suite maintainable
 * while every spec file still lists every case as a named, visible test.
 */
import { test, expect } from '@playwright/test';
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import type { ApiClient } from './api-client.js';
import { record } from './exec-recorder.js';
import { registry, blockedReason } from './tc-registry.js';
import { parseModule, reqId, type TcRow } from './tc-catalogue.js';

// Load every documented row once, keyed by TC-ID (CWD = automation/ when Playwright runs).
const ROWS = new Map<string, TcRow>();
const TC_ROOT = '../test-cases';
for (const mod of readdirSync(TC_ROOT)) {
  const dir = join(TC_ROOT, mod);
  if (!statSync(dir).isDirectory()) continue;
  for (const r of parseModule(dir, mod)) ROWS.set(r.tcId, r);
}

/** Run (or skip-with-reason) a single documented case and record the result. */
export async function runCase(api: ApiClient, tcId: string): Promise<void> {
  const row = ROWS.get(tcId);
  const base = {
    tcId,
    reqId: reqId(row?.req ?? ''),
    module: row?.module ?? '?',
    feature: row?.scenario || tcId,
    scenario: row?.steps || row?.scenario || '',
    evidence: row ? `test-cases/${row.module}` : '',
  };
  const impl = registry[tcId];
  if (!impl) {
    const reason = row ? blockedReason(row) : 'Pending implementation — no registry entry';
    record({ ...base, expected: row?.expected ?? '', actual: `BLOCKED — ${reason}`, status: 'BLOCKED' });
    test.skip(true, reason);
    return;
  }
  const res = await impl({ api, row: row as TcRow });
  record({ ...base, expected: res.expected ?? row?.expected ?? '', actual: res.actual, status: res.status, ...(res.bug ? { bug: res.bug } : {}) });
  // An un-bugged FAIL fails the Playwright test (= a regression). Known-bug FAILs and PASS stay green.
  expect(res.status === 'FAIL' && !res.bug, `${tcId} regressed: ${res.actual}`).toBeFalsy();
}
