import test from "node:test";
import assert from "node:assert/strict";
import { uptimePercent } from "./check-trends.js";

test("returns null without observations", () => assert.equal(uptimePercent([]), null));
test("computes sample success rate", () => {
  assert.equal(uptimePercent([{ timestamp: "a", ok: true }, { timestamp: "b", ok: false }]), 50);
});
