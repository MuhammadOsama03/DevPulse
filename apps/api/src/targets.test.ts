import assert from "node:assert/strict";
import test from "node:test";
import { configuredMonitorTargets } from "./targets.js";

test("deduplicates configured HTTPS targets and strips fragments", () => {
  assert.deepEqual(
    configuredMonitorTargets("https://example.com/health#secret, https://example.com/health, http://invalid.test"),
    ["https://example.com/health"]
  );
});

test("limits configured targets to a safe maximum", () => {
  const raw = Array.from({ length: 20 }, (_, i) => `https://service${i}.example.com`).join(",");
  assert.equal(configuredMonitorTargets(raw).length, 10);
});

test("empty configuration causes no outbound checks", () => {
  assert.deepEqual(configuredMonitorTargets(undefined), []);
});
