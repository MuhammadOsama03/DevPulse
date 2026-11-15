export type CheckResult = { ok: boolean; latencyMs: number | null };

export function summarizeChecks(checks: readonly CheckResult[]) {
  const validLatencies = checks.map(check => check.latencyMs).filter((n): n is number => n !== null && Number.isFinite(n) && n >= 0);
  return {
    total: checks.length,
    passing: checks.filter(check => check.ok).length,
    failing: checks.filter(check => !check.ok).length,
    averageLatencyMs: validLatencies.length ? validLatencies.reduce((a, b) => a + b, 0) / validLatencies.length : null,
  };
}
