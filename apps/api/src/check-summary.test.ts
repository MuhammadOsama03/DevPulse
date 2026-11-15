import test from "node:test";
import assert from "node:assert/strict";
import { summarizeChecks } from "./check-summary.js";

test("empty checks return null average", () => {
  assert.deepEqual(summarizeChecks([]), { total: 0, passing: 0, failing: 0, averageLatencyMs: null });
});
test("failed probes do not distort missing latency", () => {
  const summary = summarizeChecks([{ ok: true, latencyMs: 100 }, { ok: false, latencyMs: null }]);
  assert.equal(summary.averageLatencyMs, 100);
  assert.equal(summary.failing, 1);
});
