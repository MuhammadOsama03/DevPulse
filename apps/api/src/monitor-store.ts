import { mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import type { ProbeResult } from "./probe.js";

export type StoredCheck = ProbeResult;
const MAX_CHECKS = 1000;
const filePath = () => process.env.MONITOR_HISTORY_PATH || (process.env.VERCEL === "1" ? "/tmp/devpulse-history.json" : "./monitor-history.json");

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

function redisConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url && !token) return undefined;
  if (!url || !token) throw new Error("Incomplete Redis configuration");
  const endpoint = new URL(url);
  if (endpoint.protocol !== "https:" || endpoint.username || endpoint.password) {
    throw new Error("Invalid Redis HTTPS endpoint");
  }
  return { endpoint, token };
}

const historyKey = "devpulse:monitor:history:v1";

async function redis<T>(config: NonNullable<ReturnType<typeof redisConfig>>, command: unknown[], transaction = false): Promise<T> {
  const response = await fetch(transaction ? new URL("/multi-exec", config.endpoint) : config.endpoint, {
    method: "POST",
    headers: { Authorization: `Bearer ${config.token}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
    redirect: "error",
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) throw new Error("Redis request failed");
  const payload = await response.json() as { result?: T; error?: string } | { error?: string }[];
  if (transaction) {
    if (!Array.isArray(payload) || payload.length !== command.length || payload.some(item => item.error)) {
      throw new Error("Redis history transaction failed");
    }
    return undefined as T;
  }
  if (Array.isArray(payload) || payload.error || payload.result === undefined) throw new Error("Redis history request failed");
  return payload.result;
}

export async function loadHistory(): Promise<StoredCheck[]> {
  const config = redisConfig();
  if (!config) return readHistory();
  const rows = await redis<string[]>(config, ["LRANGE", historyKey, 0, -1]);
  return rows.map(row => JSON.parse(row) as StoredCheck);
}

export async function saveChecks(results: readonly StoredCheck[]): Promise<StoredCheck[]> {
  const config = redisConfig();
  if (!config) return appendHistory(results);
  if (results.length) {
    await redis(config, [
      ["RPUSH", historyKey, ...results.map(result => JSON.stringify(result))],
      ["LTRIM", historyKey, -MAX_CHECKS, -1],
    ], true);
  }
  return loadHistory();
}
