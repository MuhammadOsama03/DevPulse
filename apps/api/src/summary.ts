import type { Service } from "./sample.js";
import { averageLatency, countByStatus } from "./service-utils.js";

export function demoSummary(services: readonly Service[]) {
  return {
    source: "demo" as const,
    measured: false as const,
    total: services.length,
    statuses: countByStatus(services),
    averageLatencyMs: averageLatency(services),
  };
}
