/**
 * browser-recorder.ts — PERMANENT Browser-QA recorder.
 * (a) recordFinding(): append an exploratory finding to the Findings Register
 *     (evidence/browser/findings.ndjson) with full defect metadata.
 * (b) recordCase(): append a browser test-case outcome to the master execution ledger
 *     (evidence/exec/records.ndjson) via the existing exec-recorder — so browser results reconcile
 *     into the same dashboard/matrix as the API programme. Append-only; never overwrites.
 */
import { appendFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs';
import { record as recordLedger } from './exec-recorder.js';

const FINDINGS = '../evidence/browser/findings.ndjson';

export type FindingCategory = 'Bug' | 'Accessibility' | 'UX' | 'Performance' | 'Security' | 'Undocumented Behaviour' | 'Product Observation' | 'Technical Debt';
export interface Finding {
  category: FindingCategory;
  severity: 'Critical' | 'Major' | 'Minor' | 'Info';
  priority?: 'P0' | 'P1' | 'P2' | 'P3';
  module: string;
  page: string;
  viewport?: string;
  browser?: string;
  userImpact: string;
  businessImpact?: string;
  steps: string[];
  expected: string;
  actual: string;
  evidence: string[];
  rootCause?: string;
  suggestedFix?: string;
  reqRef?: string;
  status?: 'FAIL' | 'OBSERVATION' | 'PASS';
}

function nextId(): string {
  let n = 0;
  if (existsSync(FINDINGS)) for (const l of readFileSync(FINDINGS, 'utf8').split('\n')) { const m = l.match(/"id":"BR-(\d+)"/); if (m) n = Math.max(n, Number(m[1])); }
  return `BR-${String(n + 1).padStart(3, '0')}`;
}

export function recordFinding(f: Finding): string {
  mkdirSync('../evidence/browser', { recursive: true });
  const id = nextId();
  appendFileSync(FINDINGS, JSON.stringify({ id, ...f, browser: f.browser ?? 'chromium', ts: new Date().toISOString() }) + '\n');
  return id;
}

/** Append a browser case outcome to the master ledger (reuses real TC-ids so the dashboard reconciles). */
export function recordCase(o: { tcId: string; reqId?: string; module: string; feature: string; scenario: string; expected: string; actual: string; status: 'PASS' | 'FAIL' | 'BLOCKED'; evidence?: string; bug?: string }): void {
  recordLedger({ tcId: o.tcId, reqId: o.reqId ?? '', module: o.module, feature: o.feature, scenario: o.scenario, expected: o.expected, actual: `[browser] ${o.actual}`, status: o.status, evidence: o.evidence ?? '', ...(o.bug ? { bug: o.bug } : {}) });
}
