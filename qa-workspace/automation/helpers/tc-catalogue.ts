/**
 * tc-catalogue.ts — parse the authoritative test-case catalogue from `test-cases/<module>/*.md`.
 * Every module .md uses a 9-column markdown table:
 *   | TC ID | Req | Scenario | Preconditions | Steps | Expected Result | Pri | Sev | Auto |
 * Files may contain several tables (each re-prints the header); all are concatenated.
 * The suite is generated FROM these rows so it maps 1:1 to the documented cases.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

export interface TcRow {
  tcId: string; req: string; scenario: string; preconditions: string;
  steps: string; expected: string; pri: string; sev: string; auto: string;
  module: string; file: string;
}

const TC_RE = /^TC-[A-Z]+-\d+[a-z]?$/i;

/** Parse one .md file's tables into rows. */
export function parseFile(mdPath: string, module: string): TcRow[] {
  const lines = readFileSync(mdPath, 'utf8').split('\n');
  const rows: TcRow[] = [];
  let cols: string[] | null = null;
  for (const line of lines) {
    if (!line.trim().startsWith('|')) { cols = null; continue; } // table ended
    const cells = line.split('|').slice(1, -1).map((s) => s.trim());
    if (cells.some((c) => /^tc id$/i.test(c))) { cols = cells.map((c) => c.toLowerCase()); continue; }
    if (/^:?-{2,}/.test(cells[0] ?? '')) continue; // header separator
    if (!cols) continue;
    const id = (cells[0] ?? '').replace(/\*\*/g, '').trim();
    if (!TC_RE.test(id)) continue;
    const at = (frag: string) => { const i = cols!.findIndex((c) => c.includes(frag)); return i >= 0 ? (cells[i] ?? '').replace(/\*\*/g, '').trim() : ''; };
    rows.push({
      tcId: id, req: at('req'), scenario: at('scenario'), preconditions: at('precond'),
      steps: at('step'), expected: at('expected'), pri: at('pri'), sev: at('sev'), auto: at('auto'),
      module, file: mdPath,
    });
  }
  return rows;
}

/** Parse every .md under a module folder (handles Payroll's many sub-files). */
export function parseModule(dir: string, module: string): TcRow[] {
  const out: TcRow[] = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isFile() && name.endsWith('.md')) out.push(...parseFile(p, module));
  }
  // de-dupe by tcId (a case should appear once); keep first occurrence
  const seen = new Set<string>();
  return out.filter((r) => (seen.has(r.tcId) ? false : (seen.add(r.tcId), true)));
}

/** Normalise the .md Req column ("EMP-001") into a REQ id ("REQ-EMP-001"). */
export const reqId = (req: string) => (!req ? '' : /^req-/i.test(req) ? req.toUpperCase() : `REQ-${req.toUpperCase()}`);
