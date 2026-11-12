import type { Service } from "./sample.js";

export function isService(value: unknown): value is Service {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return typeof item.id === "string" && item.id.length > 0
    && typeof item.name === "string" && item.name.length > 0
    && (item.status === "healthy" || item.status === "degraded")
    && typeof item.latencyMs === "number" && Number.isFinite(item.latencyMs)
    && item.latencyMs >= 0;
}
