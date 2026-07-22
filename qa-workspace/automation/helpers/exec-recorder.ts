/**
 * exec-recorder.ts — append enterprise execution records (one per validated business rule) to an
 * NDJSON log. The test-management report generator aggregates these into the Test Execution Report,
 * RTM, and Coverage Dashboard. One Playwright test may emit several records (one per business rule).
 */
import { appendFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

export type ExecStatus = 'PASS' | 'FAIL' | 'BLOCKED' | 'SKIPPED' | 'NOT EXECUTED';

export interface ExecRecord {
  tcId: string;
  reqId: string;
  module: string;
  feature: string;
  scenario: string;
  expected: string;
  actual: string;
  status: ExecStatus;
  timestamp?: string;
  evidence?: string;
  bug?: string;
}

const LOG = '../evidence/exec/records.ndjson';

export function record(r: ExecRecord): ExecRecord {
  const full = { ...r, timestamp: r.timestamp ?? new Date().toISOString() };
  mkdirSync(dirname(LOG), { recursive: true });
  appendFileSync(LOG, JSON.stringify(full) + '\n');
  return full;
}

/** Record a numeric "engine == oracle (to the cent)" check and return PASS/FAIL. */
export function recordMoney(
  base: Omit<ExecRecord, 'expected' | 'actual' | 'status'>,
  actual: number,
  expected: number,
  tolerance = 0.01,
): boolean {
  const ok = Math.abs(actual - expected) <= tolerance + 1e-9; // epsilon for FP at the cent boundary
  record({ ...base, expected: expected.toFixed(2), actual: actual.toFixed(2), status: ok ? 'PASS' : 'FAIL' });
  return ok;
}
