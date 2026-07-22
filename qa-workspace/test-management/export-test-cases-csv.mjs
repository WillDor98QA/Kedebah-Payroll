/**
 * export-test-cases-csv.mjs — READ-ONLY. Emits reports/test-cases-status.csv: one row per catalogued
 * test case (417) with its current status, for opening/filtering in Excel/Sheets.
 *
 * Source of truth: test-management/test-case-catalogue.md (regenerated from the append-only ledger by
 * generate-reports.mjs) + evidence/exec/records.ndjson (for Last Verified timestamp / Evidence / Bug).
 * Does NOT modify the ledger or any report. Run `node test-management/generate-reports.mjs` first to refresh.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CATALOGUE = join(ROOT, 'test-management/test-case-catalogue.md');
const LEDGER = join(ROOT, 'evidence/exec/records.ndjson');
const OUT = join(ROOT, 'reports/test-cases-status.csv');

// ---- 1. Parse the catalogue markdown table (split on UNESCAPED pipes; unescape \| and strip md) ----
const splitRow = (line) =>
  line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split(/(?<!\\)\|/)
    .map((c) => c.replace(/\\\|/g, '|').replace(/\*\*/g, '').replace(/`/g, '').trim());

const rows = readFileSync(CATALOGUE, 'utf8')
  .split('\n')
  .filter((l) => /^\|\s*TC-/.test(l))
  .map(splitRow);
// columns: 0 TC ID, 1 Req, 2 Module, 3 Feature, 4 Scenario, 5 Type, 6 Expected, 7 Automation, 8 Verified, 9 Latest

// ---- 2. Per-tcId ledger lookup: latest record + evidence aligned to the verdict status ----
const records = readFileSync(LEDGER, 'utf8').trim().split('\n').map((l) => JSON.parse(l));
const byId = new Map();
for (const r of records) {
  if (!byId.has(r.tcId)) byId.set(r.tcId, []);
  byId.get(r.tcId).push(r);
}
const meta = (tcId, verdict) => {
  const rs = byId.get(tcId) || [];
  if (!rs.length) return { ts: '', evidence: '', bug: '' };
  const latest = rs.reduce((a, b) => (b.timestamp > a.timestamp ? b : a));
  // prefer evidence from the most recent record whose status equals the verdict (e.g. the PASS run)
  const match = rs.filter((r) => r.status === verdict).sort((a, b) => (a.timestamp > b.timestamp ? -1 : 1))[0];
  const src = match || latest;
  return { ts: (latest.timestamp || '').slice(0, 19).replace('T', ' '), evidence: src.evidence || '', bug: src.bug || '' };
};

// ---- 3. Write CSV (RFC-4180 quoting) ----
const q = (v) => {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};
const header = ['Test Case ID', 'Requirement ID', 'Module', 'Feature', 'Scenario', 'Test Type', 'Status (PASS-sticky)', 'Latest Run', 'Last Verified', 'Evidence', 'Bug'];
const lines = [header.join(',')];
const tally = {};
for (const c of rows) {
  const verdict = c[8] || '';
  tally[verdict] = (tally[verdict] || 0) + 1;
  const m = meta(c[0], verdict);
  lines.push([c[0], c[1], c[2], c[3], c[4], c[5], verdict, c[9] || '', m.ts, m.evidence, m.bug].map(q).join(','));
}
writeFileSync(OUT, lines.join('\n') + '\n');
console.log(`Wrote ${OUT}`);
console.log(`Rows: ${rows.length} test cases`);
console.log('Status (PASS-sticky) tally: ' + Object.entries(tally).sort().map(([k, v]) => `${k}=${v}`).join(' · '));
