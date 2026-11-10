import express from "express";
import { demoServices } from "./sample.js";
const app = express();
app.use(express.json());
app.get("/health", (_req, res) => res.json({ status: "ok", service: "devpulse-api", phase: "prototype" }));
app.get("/demo/services", (_req, res) => res.json({ source: "demo", measured: false, services: demoServices }));
const port = Number(process.env.PORT || 4000);
app.listen(port, () => console.log(`DevPulse API listening on http://localhost:${port}`));
