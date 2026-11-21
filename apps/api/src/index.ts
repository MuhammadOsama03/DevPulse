import { createHash, timingSafeEqual } from "node:crypto";
import express from "express";
import { demoServices } from "./sample.js";
import { config } from "./config.js";
import { corsForOrigins } from "./cors.js";
import { demoPayload } from "./payload.js";
import { demoSummary } from "./summary.js";
import { runChecks, startScheduler, monitoringHistory, alertsFor } from "./monitor-runner.js";
import { configuredMonitorTargets } from "./targets.js";
import { summarizeChecks } from "./check-summary.js";

const app = express();
app.use(corsForOrigins(config.allowedOrigins));
app.use(express.json({ limit: "32kb" }));

app.get("/health", (_req, res) => res.json({ status: "ok", service: "devpulse-api", phase: "prototype" }));
app.get("/demo/services", (_req, res) => res.json(demoPayload(demoServices)));
app.get("/demo/summary", (_req, res) => res.json(demoSummary(demoServices)));

const operatorToken = process.env.DEVPULSE_OPERATOR_TOKEN;
const digest = (value: string) => createHash("sha256").update(value).digest();
if (operatorToken) {
  const expected = digest(`Bearer ${operatorToken}`);
  app.use("/monitor", (req, res, next) => {
    if (!timingSafeEqual(digest(req.header("Authorization") ?? ""), expected)) {
      res.setHeader("WWW-Authenticate", "Bearer");
      res.status(401).json({ error: "Valid operator token required" });
      return;
    }
    next();
  });
}

type RequestWindow = { startedAt: number; count: number };
const readWindow: RequestWindow = { startedAt: 0, count: 0 };
const checkWindow: RequestWindow = { startedAt: 0, count: 0 };
app.use("/monitor", (req, res, next) => {
  const isCheck = /^\/checks\/?$/i.test(req.path);
  const window = isCheck ? checkWindow : readWindow;
  const limit = isCheck ? 6 : 60;
  const now = performance.now();
  if (now - window.startedAt >= 60_000) {
    window.startedAt = now;
    window.count = 0;
  }
  if (window.count >= limit) {
    res.setHeader("Retry-After", String(Math.ceil((60_000 - now + window.startedAt) / 1000)));
    res.status(429).json({ error: "Monitoring request limit reached" });
    return;
  }
  window.count += 1;
  next();
});

const allowedTargets = configuredMonitorTargets(process.env.MONITOR_TARGETS);
app.get("/monitor/targets", (_req, res) => res.json({ targets: allowedTargets, configured: allowedTargets.length > 0 }));
app.get("/monitor/checks", async (_req, res) => {
  // Targets come from operator configuration, never arbitrary request URLs.
  try {
    const run = await runChecks(allowedTargets);
    if (!run) { res.status(409).json({ error: "A monitoring run is already in progress" }); return; }
    const { results, alerts } = run;
    res.setHeader("Cache-Control", "no-store");
    res.json({ source: "live", results, alerts, summary: summarizeChecks(results.map(result => ({ ok: result.status === "healthy", latencyMs: result.latencyMs }))) });
  } catch { res.status(503).json({ error: "Monitoring history is unavailable" }); }
});

app.get("/monitor/history", (req, res) => {
  const limit = Number(req.query.limit ?? 100);
  if (!Number.isInteger(limit) || limit < 1 || limit > 1000) { res.status(400).json({ error: "Invalid history limit" }); return; }
  try {
    res.setHeader("Cache-Control", "no-store");
    res.json({ results: monitoringHistory(limit) });
  } catch { res.status(503).json({ error: "Monitoring history is unavailable" }); }
});
app.get("/monitor/alerts", (_req, res) => {
  try {
    res.setHeader("Cache-Control", "no-store");
    res.json({ alerts: alertsFor(monitoringHistory(1000).reverse()) });
  } catch { res.status(503).json({ error: "Monitoring history is unavailable" }); }
});

const interval = Number(process.env.MONITOR_INTERVAL_SECONDS ?? 300);
startScheduler(allowedTargets, interval);
app.listen(config.port, () => console.log(`DevPulse API listening on http://localhost:${config.port}`));
