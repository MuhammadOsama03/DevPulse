import test from "node:test";
import assert from "node:assert/strict";
import { isService } from "./service-validation.js";
import { demoServices } from "./sample.js";

test("accepts demo service", () => assert.equal(isService(demoServices[0]), true));
test("rejects negative latency", () => assert.equal(isService({ ...demoServices[0], latencyMs: -1 }), false));
test("rejects missing identifier", () => assert.equal(isService({ ...demoServices[0], id: "" }), false));
test("rejects non-finite latency", () => assert.equal(isService({ ...demoServices[0], latencyMs: Infinity }), false));
