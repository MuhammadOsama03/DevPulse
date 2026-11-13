import assert from "node:assert/strict";
import test from "node:test";
import { sortServicesByName, sortServicesByLatency } from "./sort-services.js";
import { demoServices } from "./sample.js";

test("sorts by latency descending", () => {
  assert.equal(sortServicesByLatency(demoServices)[0].id, "worker");
});
test("does not mutate source", () => {
  const original = demoServices.map(service => service.id);
  sortServicesByName(demoServices);
  assert.deepEqual(demoServices.map(service => service.id), original);
});
