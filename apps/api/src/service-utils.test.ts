import test from "node:test";
import assert from "node:assert/strict";
import { countByStatus, averageLatency } from "./service-utils.js";
import { demoServices } from "./sample.js";

test("counts fictional service statuses", () => {
  assert.deepEqual(countByStatus(demoServices), { healthy: 1, degraded: 1 });
});

test("averages illustrative latency", () => {
  assert.equal(averageLatency(demoServices), 136);
  assert.equal(averageLatency([]), null);
});
