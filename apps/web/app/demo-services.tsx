"use client";
import { useState } from "react";

type Service = { id: string; name: string; status: "healthy" | "degraded"; latencyMs: number };
type DemoResponse = { source: "demo"; measured: false; services: Service[] };

function isDemoResponse(value: unknown): value is DemoResponse {
  if (!value || typeof value !== "object") return false;
  const data = value as Record<string, unknown>;
  return data.source === "demo" && data.measured === false && Array.isArray(data.services)
    && data.services.every((item: unknown) => {
      if (!item || typeof item !== "object") return false;
      const service = item as Record<string, unknown>;
      return typeof service.id === "string" && typeof service.name === "string"
        && (service.status === "healthy" || service.status === "degraded")
        && typeof service.latencyMs === "number" && Number.isFinite(service.latencyMs);
    });
}

export default function DemoServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [message, setMessage] = useState("Demo data is not loaded.");
  const [loading, setLoading] = useState(false);
  async function load() {
    setLoading(true);
    setMessage("Loading…");
    try {
      const response = await fetch((process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000") + "/demo/services");
      if (!response.ok) throw new Error("API unavailable");
      const data: unknown = await response.json();
      if (!isDemoResponse(data)) throw new Error("Unexpected demo response");
      setServices(data.services);
      setMessage("Illustrative sample data — not live monitoring.");
    } catch {
      setServices([]);
      setMessage("Could not load demo data. Check the API and response format.");
    } finally {
      setLoading(false);
    }
  }
  return <section className="demo"><div className="demohead"><div><h2>Service preview</h2><p>Sample records only — no real service checks yet.</p></div><button onClick={load} disabled={loading}>{loading ? "Loading…" : "Load demo data"}</button></div><p role="status">{message}</p><div className="servicelist">{services.map(s => <article key={s.id}><strong>{s.name}</strong><span>{s.status} · {s.latencyMs} ms (sample)</span></article>)}</div></section>;
}
