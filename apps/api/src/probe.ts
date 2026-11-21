import https from "node:https";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

export type ProbeResult = { target: string; status: "healthy" | "degraded"; statusCode: number | null; latencyMs: number; checkedAt: string; source: "live" };
export function isPublicAddress(ip: string): boolean {
  if (isIP(ip) === 4) {
    const p = ip.split(".").map(Number);
    const [a,b,c] = p;
    return !(a === 0 || a === 10 || a === 127 || a >= 224 || a === 169 && b === 254 || a === 172 && b >= 16 && b <= 31 || a === 192 && b === 168 || a === 100 && b >= 64 && b <= 127 || a === 192 && b === 0 && c === 0 || a === 192 && b === 0 && c === 2 || a === 198 && b === 51 && c === 100 || a === 203 && b === 0 && c === 113 || a === 198 && (b === 18 || b === 19));
  }
  // Conservative MVP policy: IPv6 targets are not probed until a complete
  // special-purpose IPv6 range classifier is available.
  if (isIP(ip) === 6) return false;
  return false;
}
export function parseTarget(raw: string): URL {
  const url = new URL(raw);
  if (url.protocol !== "https:" || url.username || url.password || url.port && url.port !== "443" || !url.hostname || isIP(url.hostname.replace(/^\[|\]$/g, ""))) {
    throw new Error("Only public HTTPS hostname targets on port 443 are supported");
  }
  return url;
}
export async function probe(raw: string): Promise<ProbeResult> {
  const target = parseTarget(raw);
  const start = performance.now();
  const checkedAt = new Date().toISOString();
  let addresses: {address:string;family:number}[];
  try {
    let dnsTimer: ReturnType<typeof setTimeout> | undefined;
    try {
      addresses = await Promise.race([
        lookup(target.hostname, { all: true, verbatim: true }),
        new Promise<never>((_, reject) => { dnsTimer = setTimeout(() => reject(new Error("DNS timeout")), 3000); }),
      ]);
    } finally {
      if (dnsTimer) clearTimeout(dnsTimer);
    }
    // Pin the outbound connection to a validated public IPv4 address.
    // Reject any DNS answer containing non-public addresses to avoid mixed-answer bypasses.
    if (!addresses.length || addresses.some(({address}) => !isPublicAddress(address))) throw new Error("Unsafe DNS result");
  } catch {
    return {target: raw, status: "degraded", statusCode: null, latencyMs: Math.round(performance.now()-start), checkedAt, source: "live"};
  }
  return await new Promise(resolve => {
    let settled = false;
    const finish = (statusCode: number | null) => {
      if (settled) return;
      settled = true;
      resolve({ target: raw, status: statusCode !== null && statusCode >= 200 && statusCode < 400 ? "healthy" : "degraded", statusCode, latencyMs: Math.round(performance.now()-start), checkedAt, source: "live" });
    };
    const connection = { autoSelectFamily: false };
    const req = https.request(target, {
      ...connection,
      method: target.href === "https://codepilot-ai-gamma-drab.vercel.app/api/health" ? "GET" : "HEAD", timeout: 5000, maxHeaderSize: 8192,
      lookup: (_hostname, _options, cb) => {
        const chosen = addresses[0];
        cb(null, chosen.address, chosen.family);
      },
      headers: {"User-Agent":"DevPulse-HealthCheck/0.1", "Accept":"*/*"},
    }, res => { res.resume(); finish(res.statusCode ?? null); });
    const deadline = setTimeout(() => req.destroy(new Error("Probe deadline exceeded")), 5000);
    req.on("close", () => clearTimeout(deadline));
    req.on("timeout", () => req.destroy(new Error("Probe timeout")));
    req.on("error", () => finish(null));
    req.end();
  });
}
