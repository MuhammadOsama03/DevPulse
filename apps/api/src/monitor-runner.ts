import { probe, type ProbeResult } from "./probe.js";
import { loadHistory, saveChecks } from "./monitor-store.js";
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

async function deliverAlert(alert: MonitorAlert): Promise<void> {
  const configured = process.env.MONITOR_ALERT_WEBHOOK_URL;
  if (!configured) return;

  try {
    const url = new URL(configured);
    if (url.protocol !== "https:" || url.username || url.password) {
      throw new Error("Invalid alert webhook configuration");
    }
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event: "monitor.alert", ...alert }),
      redirect: "error",
      signal: AbortSignal.timeout(5_000),
    });
    await response.body?.cancel();
    if (!response.ok) throw new Error("Alert webhook rejected delivery");
  } catch {
    console.error("Monitoring alert webhook delivery failed");
  }
}

export async function runChecks(targets: readonly string[]): Promise<{ results: ProbeResult[]; alerts: MonitorAlert[] } | null> {
  if (running) return null;
  running = true;
  try {
    const results: ProbeResult[] = [];
    for (const target of targets.slice(0, 10)) results.push(await probe(target));
    const previouslyActive = new Set(alertsFor(await loadHistory()).map(alert => alert.target));
    const alerts = alertsFor(await saveChecks(results));
    await Promise.all(alerts.filter(alert => !previouslyActive.has(alert.target)).map(deliverAlert));
    return { results, alerts };
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

export async function monitoringHistory(limit = 100): Promise<ProbeResult[]> {
  return (await loadHistory()).slice(-Math.min(1000, Math.max(1, limit))).reverse();
}
