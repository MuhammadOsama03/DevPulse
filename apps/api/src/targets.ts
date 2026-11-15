import { parseTarget } from "./probe.js";

/** Never accept targets from a public request; only from operator environment configuration. */
export function configuredMonitorTargets(value: string | undefined, limit = 10): string[] {
  const unique = new Set<string>();
  for (const raw of (value ?? "").split(",")) {
    const candidate = raw.trim();
    if (!candidate) continue;
    try {
      const target = parseTarget(candidate);
      target.hash = "";
      unique.add(target.toString());
    } catch {
      // Invalid targets are not eligible for outbound network requests.
    }
    if (unique.size >= limit) break;
  }
  return [...unique];
}
