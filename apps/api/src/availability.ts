import type { Service } from "./sample.js";

export function demoAvailability(services: readonly Service[]) {
  return {
    source: "demo" as const,
    measured: false as const,
    available: services.filter(service => service.status === "healthy").length,
    total: services.length,
  };
}
