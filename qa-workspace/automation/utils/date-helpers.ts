/**
 * date-helpers.ts — pay-calendar date math oracle. PRD §4.
 * Used to verify pay-date offset, weekend shift-back, month-end snap, semi-monthly split, quarterly.
 */

export type Frequency = 'weekly' | 'biweekly' | 'semimonthly' | 'monthly' | 'quarterly';

const DAY_MS = 86_400_000;

export function addDays(d: Date, n: number): Date {
  return new Date(d.getTime() + n * DAY_MS);
}

/** Last day of the month for a given date (handles leap Feb). PRD §4 month-end snap. */
export function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

/**
 * Weekend pay-date shifts back to the preceding Friday (PRD §4).
 * Sat → Fri (−1), Sun → Fri (−2).
 */
export function shiftWeekendPayDateToFriday(payDate: Date): Date {
  const day = payDate.getDay(); // 0 Sun … 6 Sat
  if (day === 6) return addDays(payDate, -1);
  if (day === 0) return addDays(payDate, -2);
  return payDate;
}

/** Pay date = period end + offset days, then weekend-shifted (PRD §4). */
export function computePayDate(periodEnd: Date, offsetDays: number): Date {
  return shiftWeekendPayDateToFriday(addDays(periodEnd, offsetDays));
}

/** Semi-monthly period bounds for the half containing `d` (1–15 / 16–end). PRD §4. */
export function semiMonthlyPeriod(d: Date): { start: Date; end: Date } {
  const y = d.getFullYear();
  const m = d.getMonth();
  if (d.getDate() <= 15) {
    return { start: new Date(y, m, 1), end: new Date(y, m, 15) };
  }
  return { start: new Date(y, m, 16), end: endOfMonth(d) };
}

/** Next monthly period preserving custom shape (e.g. 15th–14th). PRD §4. */
export function nextMonthlyPeriod(start: Date, end: Date): { start: Date; end: Date } {
  const isMonthAligned = start.getDate() === 1 && end.getDate() === endOfMonth(end).getDate();
  const nextStart = new Date(start.getFullYear(), start.getMonth() + 1, start.getDate());
  if (isMonthAligned) {
    return { start: new Date(nextStart.getFullYear(), nextStart.getMonth(), 1), end: endOfMonth(nextStart) };
  }
  const nextEnd = new Date(end.getFullYear(), end.getMonth() + 1, end.getDate());
  return { start: nextStart, end: nextEnd };
}

/** Quarterly = +3 calendar months. PRD §4. */
export function nextQuarterlyPeriod(start: Date, end: Date): { start: Date; end: Date } {
  return {
    start: new Date(start.getFullYear(), start.getMonth() + 3, start.getDate()),
    end: new Date(end.getFullYear(), end.getMonth() + 3, end.getDate()),
  };
}

export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}
