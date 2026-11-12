import type { Service } from "./sample.js";

export function countByStatus(services: readonly Service[]) {
  return {
    healthy: services.filter(service => service.status === "healthy").length,
    degraded: services.filter(service => service.status === "degraded").length,
  };
}

export function averageLatency(services: readonly Service[]): number | null {
  if (!services.length) return null;
  return services.reduce((total, service) => total + service.latencyMs, 0) / services.length;
}
