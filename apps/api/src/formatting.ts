import type { Service } from "./sample.js";

export function formatLatency(service: Service): string {
  return `${service.latencyMs.toFixed(0)} ms (sample)`;
}

export function formatStatus(service: Service): string {
  return service.status === "healthy" ? "Healthy (demo)" : "Degraded (demo)";
}
