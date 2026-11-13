import express from "express";
import { demoServices } from "./sample.js";
import { config } from "./config.js";
import { corsForOrigins } from "./cors.js";
import { demoPayload } from "./payload.js";
import { demoSummary } from "./summary.js";

const app = express();
app.use(corsForOrigins(config.allowedOrigins));
app.use(express.json({ limit: "32kb" }));

app.get("/health", (_req, res) => res.json({ status: "ok", service: "devpulse-api", phase: "prototype" }));
app.get("/demo/services", (_req, res) => res.json(demoPayload(demoServices)));
app.get("/demo/summary", (_req, res) => res.json(demoSummary(demoServices)));

app.listen(config.port, () => console.log(`DevPulse API listening on http://localhost:${config.port}`));
