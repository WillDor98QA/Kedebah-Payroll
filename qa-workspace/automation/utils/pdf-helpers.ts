/**
 * pdf-helpers.ts — extract & assert payslip PDF content. PRD §21.
 * Used by TC-SLIP-004…010 to verify identity, masked details, BIK exclusion, totals, net-in-words.
 */

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - pdf-parse ships CJS without types in this scaffold
import pdfParse from 'pdf-parse';
import { readFile } from 'node:fs/promises';

export interface ExtractedPayslip {
  text: string;
  lines: string[];
}

export async function extractPayslip(filePath: string): Promise<ExtractedPayslip> {
  const buf = await readFile(filePath);
  const data = await pdfParse(buf);
  const text: string = data.text ?? '';
  return { text, lines: text.split('\n').map((l) => l.trim()).filter(Boolean) };
}

export function containsAll(text: string, needles: string[]): { ok: boolean; missing: string[] } {
  const missing = needles.filter((n) => !text.includes(n));
  return { ok: missing.length === 0, missing };
}

/** A masked number shows only the last 4 digits (PRD §13/§21, TC-SLIP-006). */
export function looksMasked(value: string): boolean {
  // e.g. "****1234" or "•••• 1234" or "XXXXXX1234"
  return /[*•xX••]{2,}\s?\d{4}\b/.test(value);
}

/** Verify a money figure appears in the payslip (formatted with thousands sep or plain). */
export function payslipHasAmount(text: string, amount: number): boolean {
  const plain = amount.toFixed(2);
  const grouped = amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return text.includes(plain) || text.includes(grouped);
}

/** Assert BIK label is NOT present in the Earnings block (PRD §21, invariant #6 / TC-SLIP-007). */
export function earningsExcludeBik(text: string, bikLabels: string[]): boolean {
  return bikLabels.every((label) => !text.includes(label));
}
