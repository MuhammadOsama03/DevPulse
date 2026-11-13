import assert from "node:assert/strict";
import test from "node:test";
import { filterServices } from "./service-filter.js";
import { demoServices } from "./sample.js";

test("filters degraded services", () => {
  const result = filterServices(demoServices, "degraded");
  assert.equal(result.length, 1);
  assert.equal(result[0].id, "worker");
});
test("returns copies", () => {
  const result = filterServices(demoServices);
  result[0].name = "Changed";
  assert.equal(demoServices[0].name, "API Gateway");
});
