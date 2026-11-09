import express from "express";
const app = express();
app.use(express.json());
app.get("/health", (_req, res) => res.json({ status: "ok", service: "devpulse-api", phase: "foundation" }));
const port = Number(process.env.PORT || 4000);
app.listen(port, () => console.log(`DevPulse API listening on http://localhost:${port}`));
// Real monitoring endpoints will be added in later milestones.
