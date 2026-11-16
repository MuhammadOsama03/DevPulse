import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import type { ProbeResult } from "./probe.js";

export type StoredCheck = ProbeResult;
const MAX_CHECKS = 1000;
const filePath = () => process.env.MONITOR_HISTORY_PATH || "./monitor-history.json";

export function readHistory(): StoredCheck[] {
  try {
    const parsed: unknown = JSON.parse(readFileSync(filePath(), "utf8"));
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is StoredCheck =>
      item !== null && typeof item === "object" &&
      typeof item.target === "string" && typeof item.checkedAt === "string" &&
      (item.status === "healthy" || item.status === "degraded") &&
      typeof item.latencyMs === "number"
    ).slice(-MAX_CHECKS);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error; // corrupt or inaccessible history must not be silently overwritten
  }
}

export function appendHistory(results: readonly StoredCheck[]): StoredCheck[] {
  const path = filePath();
  const next = [...readHistory(), ...results].slice(-MAX_CHECKS);
  mkdirSync(dirname(path), { recursive: true });
  const temp = path + "." + process.pid + ".tmp";
  writeFileSync(temp, JSON.stringify(next), { mode: 0o600 });
  renameSync(temp, path);
  return next;
}
