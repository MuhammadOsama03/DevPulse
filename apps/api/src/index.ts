import express from "express";
import { demoServices } from "./sample.js";
import { config } from "./config.js";
import { corsForOrigins } from "./cors.js";
import { demoPayload } from "./payload.js";
import { demoSummary } from "./summary.js";
import { probe, parseTarget } from "./probe.js";

const app = express();
app.use(corsForOrigins(config.allowedOrigins));
app.use(express.json({ limit: "32kb" }));

app.get("/health", (_req, res) => res.json({ status: "ok", service: "devpulse-api", phase: "prototype" }));
app.get("/demo/services", (_req, res) => res.json(demoPayload(demoServices)));
app.get("/demo/summary", (_req, res) => res.json(demoSummary(demoServices)));

const configuredTargets = (process.env.MONITOR_TARGETS ?? "").split(",").map(s => s.trim()).filter(Boolean);
const allowedTargets = configuredTargets.filter(raw => {
  try { parseTarget(raw); return true; } catch { return false; }
});
app.get("/monitor/targets", (_req, res) => res.json({ targets: allowedTargets, configured: allowedTargets.length > 0 }));
app.get("/monitor/checks", async (_req, res) => {
  // Targets come from operator configuration, never arbitrary request URLs.
  const results = [];
  for (const target of allowedTargets.slice(0, 10)) results.push(await probe(target));
  res.setHeader("Cache-Control", "no-store");
  res.json({ source: "live", results });
});

app.listen(config.port, () => console.log(`DevPulse API listening on http://localhost:${config.port}`));
