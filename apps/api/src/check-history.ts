export type HistoricalCheck = { timestamp: string; target: string; ok: boolean };

export function latestChecks(checks: readonly HistoricalCheck[], limit = 20): HistoricalCheck[] {
  if (!Number.isSafeInteger(limit) || limit < 0 || limit > 1000) throw new RangeError("Invalid history limit");
  return [...checks].sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, limit);
}
