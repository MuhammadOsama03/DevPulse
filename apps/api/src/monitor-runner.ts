import { probe, type ProbeResult } from "./probe.js";
import { appendHistory, readHistory } from "./monitor-store.js";
import { shouldAlert } from "./alert-policy.js";

let running = false;
export type MonitorAlert = { target: string; consecutiveFailures: number; checkedAt: string };

export function alertsFor(history: readonly ProbeResult[], threshold = 3): MonitorAlert[] {
  const targets = [...new Set(history.map(item => item.target))];
  return targets.flatMap(target => {
    const checks = history.filter(item => item.target === target);
    if (!shouldAlert(checks.map(item => ({ ok: item.status === "healthy" })), threshold)) return [];
    return [{ target, consecutiveFailures: threshold, checkedAt: checks[checks.length - 1].checkedAt }];
  });
}

export async function runChecks(targets: readonly string[]): Promise<{ results: ProbeResult[]; alerts: MonitorAlert[] } | null> {
  if (running) return null;
  running = true;
  try {
    const results: ProbeResult[] = [];
    for (const target of targets.slice(0, 10)) results.push(await probe(target));
    const history = appendHistory(results);
    return { results, alerts: alertsFor(history) };
  } finally {
    running = false;
  }
}

export function startScheduler(targets: readonly string[], seconds: number): void {
  if (!targets.length || !Number.isInteger(seconds) || seconds < 60 || seconds > 3600) return;
  const timer = setInterval(() => {
    void runChecks(targets).catch(error => {
      console.error("Scheduled monitoring failed:", error instanceof Error ? error.message : "unknown error");
    });
  }, seconds * 1000);
  timer.unref();
}

export function monitoringHistory(limit = 100): ProbeResult[] {
  return readHistory().slice(-Math.min(1000, Math.max(1, limit))).reverse();
}
