import assert from "node:assert/strict";
import test from "node:test";
import { alertsFor } from "./monitor-runner.js";
import type { ProbeResult } from "./probe.js";

const check = (target: string, status: "healthy" | "degraded", index: number): ProbeResult => ({
  target, status, statusCode: status === "healthy" ? 200 : 500,
  latencyMs: 100, checkedAt: new Date(1700000000000 + index * 1000).toISOString(), source: "live"
});

test("alert requires three consecutive failures for the same target", () => {
  const a = "https://a.example.com/";
  const b = "https://b.example.com/";
  const history = [check(a,"degraded",0),check(b,"healthy",1),check(a,"degraded",2),check(a,"degraded",3)];
  assert.deepEqual(alertsFor(history).map(item => item.target), [a]);
  assert.deepEqual(alertsFor([...history, check(a,"healthy",4)]), []);
});

test("two failures alone do not alert", () => {
  assert.equal(alertsFor([check("https://example.com/","degraded",0),check("https://example.com/","degraded",1)]).length, 0);
});
