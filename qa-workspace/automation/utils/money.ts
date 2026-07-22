/**
 * Money helpers. Ghana cedi (GH₵), 2 decimal places.
 * Rounding rule is configurable because the engine's exact rounding must be VERIFIED, not assumed
 * (REQ-CAL-016 / TC-CAL-023). Default: round half-up to 2dp.
 */

export type Money = number;

/** Round half-up to `dp` decimals (avoids binary FP surprises via epsilon nudge). */
export function round(value: number, dp = 2): Money {
  const f = 10 ** dp;
  return Math.round((value + Number.EPSILON) * f) / f;
}

/** Sum with rounding applied to each addend first, then to the total (REQ-CAL-016). */
export function sumRounded(values: number[], dp = 2): Money {
  return round(values.reduce((a, v) => a + round(v, dp), 0), dp);
}

/** Assert two money values are equal to the cent. Returns the absolute diff for reporting. */
export function moneyDiff(actual: number, expected: number): number {
  return Math.abs(round(actual) - round(expected));
}

export function isMoneyEqual(actual: number, expected: number, toleranceCents = 0): boolean {
  return moneyDiff(actual, expected) <= toleranceCents / 100;
}
