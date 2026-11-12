import test from "node:test";
import assert from "node:assert/strict";
import { demoSummary } from "./summary.js";
import { demoServices } from "./sample.js";

test("summary never claims live measurements", () => {
  const summary = demoSummary(demoServices);
  assert.equal(summary.source, "demo");
  assert.equal(summary.measured, false);
  assert.equal(summary.total, 2);
  assert.equal(summary.averageLatencyMs, 136);
});
