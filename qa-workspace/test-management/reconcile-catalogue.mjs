/**
 * reconcile-catalogue.mjs — align evidence/exec/records.ndjson to the test-cases/*.md catalogue.
 * Keeps only records whose tcId is a REAL documented TC-ID (drops invented IDs + throwaway-wave records),
 * de-dupes by tcId::scenario keeping the latest timestamp, and reports catalogue coverage.
 * Run after the .md-driven suite: `node test-management/reconcile-catalogue.mjs`
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const TC = /^TC-[A-Z]+-\d+[a-z]?$/i;

// 1) build the real catalogue TC-ID set from test-cases/*.md
const catalogue = new Set();
const tcRoot = join(ROOT, 'test-cases');
for (const mod of readdirSync(tcRoot)) {
  const dir = join(tcRoot, mod);
  if (!statSync(dir).isDirectory()) continue;
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.md'))) {
    for (const ln of readFileSync(join(dir, f), 'utf8').split('\n')) {
      if (!ln.trim().startsWith('|')) continue;
      const id = (ln.split('|')[1] ?? '').replace(/\*\*/g, '').trim();
      if (TC.test(id)) catalogue.add(id);
    }
  }
}

// 2) load records, split catalogue vs invented
const f = join(ROOT, 'evidence/exec/records.ndjson');
const recs = readFileSync(f, 'utf8').trim().split('\n').map((l) => JSON.parse(l));
const inCat = recs.filter((r) => catalogue.has(r.tcId));
const invented = [...new Set(recs.filter((r) => !catalogue.has(r.tcId)).map((r) => r.tcId))];

// 3) de-dupe by tcId::scenario, keep latest
const latest = new Map();
for (const r of inCat) { const k = `${r.tcId}::${r.scenario}`; if (!latest.has(k) || r.timestamp > latest.get(k).timestamp) latest.set(k, r); }
const kept = [...latest.values()];
writeFileSync(f, kept.map((r) => JSON.stringify(r)).join('\n') + '\n');

// 4) report
const covered = new Set(kept.map((r) => r.tcId));
const P = kept.filter((r) => r.status === 'PASS').length, Fl = kept.filter((r) => r.status === 'FAIL').length, B = kept.filter((r) => r.status === 'BLOCKED').length;
console.log(`catalogue TC-IDs: ${catalogue.size}`);
console.log(`records: ${recs.length} → kept ${kept.length} (dropped ${recs.length - kept.length}; invented IDs removed: ${invented.length})`);
console.log(`catalogue coverage: ${covered.size}/${catalogue.size} TC-IDs have a record`);
console.log(`status: ${P} PASS · ${Fl} FAIL · ${B} BLOCKED`);
if (invented.length) console.log(`dropped invented IDs: ${invented.slice(0, 30).join(', ')}${invented.length > 30 ? ' …' : ''}`);
