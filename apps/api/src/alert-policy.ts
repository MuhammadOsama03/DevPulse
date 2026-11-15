export type AlertObservation = { ok: boolean };

export function shouldAlert(checks: readonly AlertObservation[], consecutiveFailures = 3): boolean {
  if (!Number.isSafeInteger(consecutiveFailures) || consecutiveFailures < 1) throw new RangeError("Invalid failure threshold");
  if (checks.length < consecutiveFailures) return false;
  return checks.slice(-consecutiveFailures).every(check => !check.ok);
}
