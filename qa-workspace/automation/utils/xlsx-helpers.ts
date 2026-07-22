/**
 * xlsx-helpers.ts — parse & assert the Generic Bank Payment File. PRD §19.
 * Used by TC-PAYM-003…011 to verify structure, columns, sort order, exclusions, totals.
 */

import ExcelJS from 'exceljs';

/** Exact column order from PRD §19. */
export const BANK_FILE_COLUMNS = [
  '#',
  'Employee ID',
  'Employee Full Name',
  'Department',
  'Position',
  'Account Number',
  'Bank Name',
  'Bank Sort Code',
  'Bank Branch',
  'Net Pay Amount',
  'Payment Reference',
  'Narration / Remarks',
  'Email Address',
  'Contact Number',
] as const;

export interface BankFileRow {
  bankName: string;
  employeeName: string;
  accountNumber: string;
  sortCode: string;
  netPay: number;
  paymentReference: string;
  raw: (string | number | null)[];
}

export interface ParsedBankFile {
  headerRowIndex: number;
  rows: BankFileRow[];
  totalRow?: { netPay: number };
  countRowText?: string; // "{n} Employee(s)"
}

export async function parseBankFile(filePath: string): Promise<ParsedBankFile> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.readFile(filePath);
  const ws = wb.worksheets[0];
  if (!ws) throw new Error('Bank file has no worksheet');

  // Locate the header row by matching the first column header.
  let headerRowIndex = -1;
  ws.eachRow((row, idx) => {
    if (headerRowIndex === -1 && String(row.getCell(1).value ?? '').trim() === '#') {
      headerRowIndex = idx;
    }
  });
  if (headerRowIndex === -1) throw new Error('Could not locate header row (# column)');

  const rows: BankFileRow[] = [];
  let totalRow: { netPay: number } | undefined;
  let countRowText: string | undefined;

  for (let r = headerRowIndex + 1; r <= ws.rowCount; r++) {
    const row = ws.getRow(r);
    const first = String(row.getCell(1).value ?? '').trim();
    const label = String(row.getCell(2).value ?? '').trim().toUpperCase();

    if (label === 'TOTAL' || first.toUpperCase() === 'TOTAL') {
      totalRow = { netPay: Number(row.getCell(10).value ?? 0) };
      continue;
    }
    if (/employee\(s\)/i.test(first) || /employee\(s\)/i.test(label)) {
      countRowText = first || label;
      continue;
    }
    if (!first) continue;

    rows.push({
      employeeName: String(row.getCell(3).value ?? ''),
      accountNumber: String(row.getCell(6).value ?? ''),
      bankName: String(row.getCell(7).value ?? ''),
      sortCode: String(row.getCell(8).value ?? ''),
      netPay: Number(row.getCell(10).value ?? 0),
      paymentReference: String(row.getCell(11).value ?? ''),
      raw: (row.values as (string | number | null)[]).slice(1),
    });
  }

  return { headerRowIndex, rows, totalRow, countRowText };
}

/** Assert rows are sorted by bank name, then employee name (PRD §19 / TC-PAYM-005). */
export function isSortedByBankThenName(rows: BankFileRow[]): boolean {
  for (let i = 1; i < rows.length; i++) {
    const a = rows[i - 1]!;
    const b = rows[i]!;
    const bankCmp = a.bankName.localeCompare(b.bankName);
    if (bankCmp > 0) return false;
    if (bankCmp === 0 && a.employeeName.localeCompare(b.employeeName) > 0) return false;
  }
  return true;
}

export function sumNetPay(rows: BankFileRow[]): number {
  return Math.round(rows.reduce((a, r) => a + r.netPay, 0) * 100) / 100;
}
