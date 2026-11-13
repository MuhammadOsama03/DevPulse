import type { Service } from "./sample.js";

export function sortServicesByName(services: readonly Service[]): Service[] {
  return [...services].sort((a, b) => a.name.localeCompare(b.name));
}

export function sortServicesByLatency(services: readonly Service[]): Service[] {
  return [...services].sort((a, b) => b.latencyMs - a.latencyMs);
}
