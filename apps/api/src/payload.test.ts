import assert from "node:assert/strict";
import test from "node:test";
import { demoPayload } from "./payload.js";
import { demoServices } from "./sample.js";

test("demo payload is clearly marked unmeasured", () => {
  const result = demoPayload(demoServices);
  assert.equal(result.source, "demo");
  assert.equal(result.measured, false);
  assert.equal(result.services.length, 2);
});

test("demo payload does not mutate source records", () => {
  const result = demoPayload(demoServices);
  result.services[0].name = "Changed";
  assert.equal(demoServices[0].name, "API Gateway");
});
