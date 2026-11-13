import assert from "node:assert/strict";
import test from "node:test";
import { formatLatency, formatStatus } from "./formatting.js";
import { demoServices } from "./sample.js";

test("formats demo latency", () => assert.equal(formatLatency(demoServices[0]), "42 ms (sample)"));
test("marks status as demo", () => assert.equal(formatStatus(demoServices[1]), "Degraded (demo)"));
