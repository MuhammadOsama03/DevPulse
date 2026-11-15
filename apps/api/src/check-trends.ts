export type TimedCheck = { timestamp: string; ok: boolean };

export function uptimePercent(checks: readonly TimedCheck[]): number | null {
  if (!checks.length) return null;
  return Math.round((checks.filter(check => check.ok).length / checks.length) * 10000) / 100;
}
