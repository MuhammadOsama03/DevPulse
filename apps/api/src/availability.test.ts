import assert from "node:assert/strict";
import test from "node:test";
import { demoAvailability } from "./availability.js";
import { demoServices } from "./sample.js";

test("demo availability is explicitly unmeasured", () => {
  assert.deepEqual(demoAvailability(demoServices), { source: "demo", measured: false, available: 1, total: 2 });
});
